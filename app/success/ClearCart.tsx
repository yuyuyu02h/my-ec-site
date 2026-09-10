"use client";

import { useEffect } from "react";
import { useCart } from "@/app/cart/CartProvider";

export default function ClearCart({ shouldClear }: { shouldClear: boolean }) {
  const { clearCart, isReady } = useCart();

  useEffect(() => {
    if (isReady && shouldClear) {
      clearCart();
    }
  }, [clearCart, isReady, shouldClear]);

  return null;
}
