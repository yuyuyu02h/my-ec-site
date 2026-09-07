"use client";

import { useState } from "react";

type Props = {
  productId: number;
  name?: string;
  price?: number;
};

export default function BuyButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error("Checkout session creation failed");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("決済ページの作成に失敗しました。");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="mt-10 w-full border border-black bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "LOADING..." : "BUY NOW"}
    </button>
  );
}
