"use client";

import Link from "next/link";
import { useCart } from "@/app/cart/CartProvider";

export default function CartLink() {
  const { isReady, itemCount } = useCart();

  return (
    <Link href="/cart" className="whitespace-nowrap hover:underline">
      CART{isReady && itemCount > 0 ? ` (${itemCount})` : ""}
    </Link>
  );
}
