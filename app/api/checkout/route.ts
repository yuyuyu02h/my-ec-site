import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  CheckoutItem,
  MAX_DISTINCT_ITEMS,
  MAX_ITEM_QUANTITY,
  MAX_TOTAL_QUANTITY,
} from "@/lib/cart";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function parseCheckoutItems(body: unknown): CheckoutItem[] | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const requestBody = body as {
    items?: unknown;
    productId?: unknown;
  };
  const rawItems = Array.isArray(requestBody.items)
    ? requestBody.items
    : requestBody.productId !== undefined
      ? [{ productId: requestBody.productId, quantity: 1 }]
      : [];

  if (rawItems.length === 0 || rawItems.length > MAX_DISTINCT_ITEMS) {
    return null;
  }

  const quantities = new Map<number, number>();

  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== "object") {
      return null;
    }

    const { productId, quantity } = rawItem as {
      productId?: unknown;
      quantity?: unknown;
    };

    if (
      !Number.isSafeInteger(productId) ||
      !Number.isInteger(quantity) ||
      Number(productId) <= 0 ||
      Number(quantity) < 1 ||
      Number(quantity) > MAX_ITEM_QUANTITY
    ) {
      return null;
    }

    const id = Number(productId);
    const mergedQuantity = (quantities.get(id) ?? 0) + Number(quantity);

    if (mergedQuantity > MAX_ITEM_QUANTITY) {
      return null;
    }

    quantities.set(id, mergedQuantity);
  }

  const items = Array.from(quantities, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return totalQuantity <= MAX_TOTAL_QUANTITY ? items : null;
}

export async function POST(request: Request) {
  try {
    const items = parseCheckoutItems(await request.json());

    if (!items) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    const productIds = items.map((item) => item.productId);
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, is_available")
      .in("id", productIds)
      .eq("is_available", true);

    if (
      productError ||
      !products ||
      products.length !== productIds.length
    ) {
      console.error("Product lookup failed:", productError);

      return NextResponse.json(
        { error: "One or more products are unavailable" },
        { status: 404 }
      );
    }

    const productsById = new Map(
      products.map((product) => [Number(product.id), product])
    );
    const validatedItems = items.map((item) => ({
      ...item,
      product: productsById.get(item.productId),
    }));

    if (
      validatedItems.some(
        ({ product }) =>
          !product ||
          !Number.isSafeInteger(product.price) ||
          product.price <= 0
      )
    ) {
      console.error("Invalid product data found during checkout");

      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 500 }
      );
    }

    const cartMetadata = JSON.stringify(
      items.map(({ productId, quantity }) => ({
        id: productId,
        q: quantity,
      }))
    );

    if (cartMetadata.length > 500) {
      return NextResponse.json(
        { error: "Cart contains too many items" },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: validatedItems.map(({ product, quantity }) => ({
        price_data: {
          currency: "jpy",
          product_data: {
            name: product!.name,
          },
          unit_amount: product!.price,
        },
        quantity,
      })),
      shipping_address_collection: {
        allowed_countries: ["JP"],
      },
      metadata: {
        cart: cartMetadata,
        productId: String(items[0].productId),
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
