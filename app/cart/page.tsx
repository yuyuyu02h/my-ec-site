"use client";

import Link from "next/link";
import { useState } from "react";
import StoreHeader from "@/app/components/StoreHeader";
import { MAX_ITEM_QUANTITY } from "@/lib/cart";
import { useCart } from "./CartProvider";

export default function CartPage() {
  const {
    items,
    isReady,
    subtotal,
    removeItem,
    setQuantity,
    clearCart,
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map(({ productId, quantity }) => ({
            productId,
            quantity,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok || typeof data.url !== "string") {
        throw new Error("Checkout session creation failed");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("決済ページの作成に失敗しました。商品情報をご確認ください。");
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <StoreHeader />

      <section className="px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.25em] text-gray-500">YOUR ORDER</p>
          <h1 className="mt-3 text-3xl font-bold">SHOPPING CART</h1>

          {!isReady ? (
            <p className="mt-12 border-t border-black py-10 text-sm text-gray-500">
              LOADING CART...
            </p>
          ) : items.length === 0 ? (
            <div className="mt-12 border-t border-black py-16 text-center">
              <p className="text-sm text-gray-600">カートは空です。</p>
              <Link
                href="/#products"
                className="mt-8 inline-block border border-black px-8 py-4 text-sm font-medium transition hover:bg-black hover:text-white"
              >
                VIEW PRODUCTS
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-10 border-t border-black">
                {items.map((item) => (
                  <article
                    key={item.productId}
                    className="grid gap-5 border-b border-gray-200 py-6 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-semibold hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-2 text-xs text-gray-500">
                        SIZE: {item.size ?? "-"}
                      </p>
                      <p className="mt-1 text-sm">
                        ¥{item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`${item.name}の数量を減らす`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          setQuantity(item.productId, item.quantity - 1)
                        }
                        className="flex size-10 items-center justify-center border border-gray-300 text-lg disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`${item.name}の数量を増やす`}
                        disabled={item.quantity >= MAX_ITEM_QUANTITY}
                        onClick={() =>
                          setQuantity(item.productId, item.quantity + 1)
                        }
                        className="flex size-10 items-center justify-center border border-gray-300 text-lg disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:min-w-40 sm:justify-end">
                      <p className="whitespace-nowrap text-sm font-medium">
                        ¥{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        type="button"
                        aria-label={`${item.name}をカートから削除`}
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-gray-500 underline hover:text-black"
                      >
                        REMOVE
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex gap-6">
                  <Link href="/#products" className="text-sm underline">
                    CONTINUE SHOPPING
                  </Link>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-sm text-gray-500 underline hover:text-black"
                  >
                    CLEAR CART
                  </button>
                </div>

                <div className="w-full border-t border-black pt-6 sm:w-80">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SUBTOTAL</span>
                    <span className="text-xl font-semibold">
                      ¥{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    配送料などがある場合は決済画面で確定します。
                  </p>
                  <button
                    type="button"
                    disabled={isCheckingOut}
                    onClick={handleCheckout}
                    className="mt-6 w-full border border-black bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckingOut ? "LOADING..." : "PROCEED TO CHECKOUT"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
