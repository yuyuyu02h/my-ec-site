"use client";

import { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  productName: string;
  addedQuantity: number;
  cartItemCount: number;
  isCheckingOut: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
};

export default function AddedToCartDialog({
  isOpen,
  productName,
  addedQuantity,
  cartItemCount,
  isCheckingOut,
  errorMessage,
  onClose,
  onContinueShopping,
  onCheckout,
}: Props) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    continueButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCheckingOut) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCheckingOut, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-dialog-title"
        aria-describedby="cart-dialog-description"
        className="relative w-full max-w-md border border-black bg-white p-6 text-black sm:p-8"
      >
        <button
          type="button"
          aria-label="ダイアログを閉じる"
          title="閉じる"
          disabled={isCheckingOut}
          onClick={onClose}
          className="absolute right-4 top-4 flex size-10 items-center justify-center text-2xl leading-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          ×
        </button>

        <p className="text-xs tracking-[0.2em] text-gray-500">CART UPDATED</p>
        <h2 id="cart-dialog-title" className="mt-3 pr-10 text-xl font-bold">
          カートに追加されました。
        </h2>
        <div
          id="cart-dialog-description"
          className="mt-5 border-y border-gray-200 py-5 text-sm leading-7"
        >
          <p>
            {productName}を{addedQuantity}点追加しました。
          </p>
          <p className="text-gray-500">現在のカート：{cartItemCount}点</p>
        </div>
        <p className="mt-6 text-sm font-medium">買い物を続けますか？</p>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            ref={continueButtonRef}
            type="button"
            disabled={isCheckingOut}
            onClick={onContinueShopping}
            className="border border-black px-5 py-4 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            買い物を続ける
          </button>
          <button
            type="button"
            disabled={isCheckingOut}
            onClick={onCheckout}
            className="border border-black bg-black px-5 py-4 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCheckingOut ? "準備中..." : "購入に進む"}
          </button>
        </div>
      </section>
    </div>
  );
}
