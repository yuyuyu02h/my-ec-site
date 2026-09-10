import type { CheckoutItem } from "@/lib/cart";

export async function createCheckoutUrl(items: CheckoutItem[]) {
  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });
  const data: unknown = await response.json();

  if (
    !response.ok ||
    !data ||
    typeof data !== "object" ||
    !("url" in data) ||
    typeof data.url !== "string"
  ) {
    throw new Error("Checkout session creation failed");
  }

  return data.url;
}
