import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { logoutAdmin } from "@/app/admin/login/actions";
import OrdersTable from "./OrdersTable";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load orders:", error);

    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">ORDERS</h1>

        <p className="mt-6 text-red-600">
          注文データの取得に失敗しました。
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">ORDERS</h1>

        <form action={logoutAdmin}>
          <button
            type="submit"
            className="border border-black px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
          >
            LOGOUT
          </button>
        </form>
      </div>

      <OrdersTable orders={orders ?? []} />
    </main>
  );
}
