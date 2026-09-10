import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  CheckoutItem,
  MAX_DISTINCT_ITEMS,
  MAX_ITEM_QUANTITY,
  MAX_TOTAL_QUANTITY,
} from "@/lib/cart";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const cryptoProvider = Stripe.createSubtleCryptoProvider();

function parseCartMetadata(metadata: Stripe.Metadata | null): CheckoutItem[] | null {
  const rawCart = metadata?.cart;

  if (!rawCart) {
    const legacyProductId = Number(metadata?.productId);

    return Number.isSafeInteger(legacyProductId) && legacyProductId > 0
      ? [{ productId: legacyProductId, quantity: 1 }]
      : null;
  }

  try {
    const parsed: unknown = JSON.parse(rawCart);

    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      parsed.length > MAX_DISTINCT_ITEMS
    ) {
      return null;
    }

    const items = parsed.map((value) => {
      if (!value || typeof value !== "object") {
        return null;
      }

      const { id, q } = value as { id?: unknown; q?: unknown };

      if (
        !Number.isSafeInteger(id) ||
        !Number.isInteger(q) ||
        Number(id) <= 0 ||
        Number(q) < 1 ||
        Number(q) > MAX_ITEM_QUANTITY
      ) {
        return null;
      }

      return { productId: Number(id), quantity: Number(q) };
    });

    if (items.some((item) => item === null)) {
      return null;
    }

    const validatedItems = items as CheckoutItem[];
    const totalQuantity = validatedItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    return totalQuantity <= MAX_TOTAL_QUANTITY ? validatedItems : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
      undefined,
      cryptoProvider
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const cartItems = parseCartMetadata(session.metadata);

    if (!cartItems) {
      console.error("Missing or invalid cart metadata");

      return NextResponse.json(
        { error: "Invalid cart metadata" },
        { status: 400 }
      );
    }

    const productIds = cartItems.map((item) => item.productId);
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name")
      .in("id", productIds);

    if (
      productError ||
      !products ||
      products.length !== productIds.length
    ) {
      console.error("Product lookup failed:", productError);

      return NextResponse.json(
        { error: "One or more products were not found" },
        { status: 500 }
      );
    }

    const productsById = new Map(
      products.map((product) => [Number(product.id), product])
    );
    const productSummary = cartItems
      .map((item) => {
        const product = productsById.get(item.productId);

        return `${product!.name} x ${item.quantity}`;
      })
      .join(" / ");

    const customerName = session.customer_details?.name ?? null;
    const address = session.customer_details?.address;

    const postalCode = address?.postal_code ?? null;
    const country = address?.country ?? null;

    const shippingAddress = address
      ? [
          address.state,
          address.city,
          address.line1,
          address.line2,
        ]
          .filter(Boolean)
          .join(" ")
      : null;

    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .upsert(
        {
          stripe_session_id: session.id,
          product_id: cartItems[0].productId,
          product_name: productSummary,
          amount: session.amount_total ?? 0,
          customer_email: session.customer_details?.email ?? null,
          customer_name: customerName,
          postal_code: postalCode,
          shipping_address: shippingAddress,
          country,
          status: "paid",
        },
        {
          onConflict: "stripe_session_id",
        }
      );

    if (orderError) {
      console.error("Order upsert failed:", orderError);

      return NextResponse.json(
        { error: "Failed to save order" },
        { status: 500 }
      );
    }

    console.log("Order saved or updated:", session.id);
  }

  return NextResponse.json({ received: true });
}
