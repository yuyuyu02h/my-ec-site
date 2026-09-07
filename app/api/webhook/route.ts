import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
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

    const productId = session.metadata?.productId;

    if (!productId) {
      console.error("Missing productId in Stripe metadata");

      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      );
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("Product lookup failed:", productError);

      return NextResponse.json(
        { error: "Product not found" },
        { status: 500 }
      );
    }

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
          product_id: product.id,
          product_name: product.name,
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