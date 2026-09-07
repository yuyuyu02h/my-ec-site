import { NextResponse } from "next/server";
import { getAdminAuthResult } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const allowedStatuses = [
  "paid",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
];

export async function POST(request: Request) {
  try {
    const auth = await getAdminAuthResult();

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();

    const { orderId, status } = body;

    if (!orderId || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        status,
      })
      .eq("id", orderId);

    if (error) {
      console.error("Order status update failed:", error);

      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Order status API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
