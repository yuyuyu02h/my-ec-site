"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/cart/CartProvider";
import {
  MAX_ITEM_QUANTITY,
  MAX_TOTAL_QUANTITY,
} from "@/lib/cart";
import { createCheckoutUrl } from "@/lib/checkoutClient";
import AddedToCartDialog from "./AddedToCartDialog";

type Props = {
  productId: number;
  name: string;
  price: number;
  size: string | null;
};

export default function BuyButton({ productId, name, price, size }: Props) {
  const router = useRouter();
  const { addItem, isReady, itemCount, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedQuantity, setAddedQuantity] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentProductQuantity =
    items.find((item) => item.productId === productId)?.quantity ?? 0;
  const availableQuantity = Math.min(
    MAX_ITEM_QUANTITY - currentProductQuantity,
    MAX_TOTAL_QUANTITY - itemCount
  );

  const handleAddToCart = () => {
    const quantityToAdd = Math.min(quantity, availableQuantity);

    if (!isReady || quantityToAdd <= 0) {
      return;
    }

    addItem({ productId, name, price, size }, quantityToAdd);
    setAddedQuantity(quantityToAdd);
    setErrorMessage(null);
    setIsDialogOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsDialogOpen(false);
    setErrorMessage(null);
  }, []);

  const handleContinueShopping = () => {
    handleClose();
    router.push("/");
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      setErrorMessage(null);

      const checkoutUrl = await createCheckoutUrl(
        items.map(({ productId: id, quantity: itemQuantity }) => ({
          productId: id,
          quantity: itemQuantity,
        }))
      );

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "決済ページの作成に失敗しました。商品情報をご確認ください。"
      );
      setIsCheckingOut(false);
    }
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
        disabled={!isReady || availableQuantity <= 0}
        className="mt-6 w-full border border-black bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {availableQuantity <= 0 ? "MAXIMUM IN CART" : "ADD TO CART"}
      </button>

      <AddedToCartDialog
        isOpen={isDialogOpen}
        productName={name}
        addedQuantity={addedQuantity}
        cartItemCount={itemCount}
        isCheckingOut={isCheckingOut}
        errorMessage={errorMessage}
        onClose={handleClose}
        onContinueShopping={handleContinueShopping}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
