import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        {
          error: "Product ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, is_available")
      .eq("id", productId)
      .eq("is_available", true)
      .single();

    if (productError || !product) {
      console.error("Product lookup failed:", productError);

      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const origin = request.headers.get("origin");

    if (!origin) {
      return NextResponse.json(
        {
          error: "Invalid request origin",
        },
        {
          status: 400,
        }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],

      shipping_address_collection: {
  allowed_countries: ["JP"],
},

      metadata: {
        productId: String(product.id),
      },

      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/${product.id}`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
      },
      {
        status: 500,
      }
    );
  }
}