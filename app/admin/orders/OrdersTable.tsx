"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  product_name: string;
  amount: number;
  customer_name: string | null;
  customer_email: string | null;
  postal_code: string | null;
  shipping_address: string | null;
  status: string;
  created_at: string;
};

type Props = {
  orders: Order[];
};

const statuses = [
  "paid",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
];

export default function OrdersTable({ orders }: Props) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      setUpdatingId(orderId);

      const response = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (response.status === 403) {
        alert("管理者権限がありません。");
        return;
      }

      if (!response.ok) {
        throw new Error("Status update failed");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("ステータスの更新に失敗しました。");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-black">
            <th className="px-3 py-3">ID</th>
            <th className="px-3 py-3">商品</th>
            <th className="px-3 py-3">金額</th>
            <th className="px-3 py-3">名前</th>
            <th className="px-3 py-3">メール</th>
            <th className="px-3 py-3">住所</th>
            <th className="px-3 py-3">STATUS</th>
            <th className="px-3 py-3">注文日時</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-gray-200 align-top"
            >
              <td className="px-3 py-4">{order.id}</td>

              <td className="px-3 py-4">
                {order.product_name}
              </td>

              <td className="px-3 py-4">
                ¥{order.amount.toLocaleString()}
              </td>

              <td className="px-3 py-4">
                {order.customer_name ?? "-"}
              </td>

              <td className="px-3 py-4">
                {order.customer_email ?? "-"}
              </td>

              <td className="px-3 py-4">
                <div>{order.postal_code ?? ""}</div>
                <div>{order.shipping_address ?? "-"}</div>
              </td>

              <td className="px-3 py-4">
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) =>
                    updateStatus(order.id, e.target.value)
                  }
                  className="border border-gray-300 px-2 py-1"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>

              <td className="px-3 py-4 whitespace-nowrap">
                {new Date(order.created_at).toLocaleString("ja-JP")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
