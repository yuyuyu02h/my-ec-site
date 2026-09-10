"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/app/cart/CartProvider";
import { MAX_ITEM_QUANTITY } from "@/lib/cart";

type Props = {
  productId: number;
  name: string;
  price: number;
  size: string | null;
};

export default function BuyButton({ productId, name, price, size }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({ productId, name, price, size }, quantity);
    setIsAdded(true);
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between border-y border-gray-200 py-4">
        <span className="text-sm">QUANTITY</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="数量を減らす"
            disabled={quantity <= 1}
            onClick={() => {
              setQuantity((current) => Math.max(1, current - 1));
              setIsAdded(false);
            }}
            className="flex size-10 items-center justify-center border border-gray-300 text-lg disabled:cursor-not-allowed disabled:opacity-30"
          >
            -
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            aria-label="数量を増やす"
            disabled={quantity >= MAX_ITEM_QUANTITY}
            onClick={() => {
              setQuantity((current) =>
                Math.min(MAX_ITEM_QUANTITY, current + 1)
              );
              setIsAdded(false);
            }}
            className="flex size-10 items-center justify-center border border-gray-300 text-lg disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-6 w-full border border-black bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-white hover:text-black"
      >
        {isAdded ? "ADDED TO CART" : "ADD TO CART"}
      </button>

      {isAdded && (
        <Link
          href="/cart"
          className="mt-4 block text-center text-sm font-medium underline"
        >
          VIEW CART
        </Link>
      )}
    </div>
  );
}
