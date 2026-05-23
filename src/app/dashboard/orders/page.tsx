"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, ShieldAlert } from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY"
  | "SERVED"
  | "BILLED"
  | "PAID"
  | "CANCELLED"
  | string;

type OrderRow = {
  id: string;
  orderNumber: string;
  type: string;
  status: OrderStatus;
  total: number;
  paidAmount?: number | null;
  table?: { id: string; name: string } | null;
  customer?: { id: string; name: string } | null;
  createdAt?: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Tabs: one tab for ALL non-paid orders, and one tab for paid orders
  const [tab, setTab] = useState<"unpaid" | "paid">("unpaid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    // Role guard (frontend)
    const role = user?.role;
    const allowed =
      role === "ADMIN" || role === "MANAGER" || role === "CASHIER";
    if (role && !allowed) router.replace("/dashboard");
  }, [router, user?.role]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const fetchOrders = async () => {
      try {
        if (tab === "paid") {
          const res = await api.get(`/orders?status=PAID&page=1&limit=50`);
          if (!cancelled) setOrders(res.orders || []);
          return;
        }

        // Non-paid: fetch all, then filter out PAID client-side
        const res = await api.get(`/orders?page=1&limit=50`);
        if (!cancelled) {
          setOrders(
            (res.orders || []).filter((o: OrderRow) => o.status !== "PAID"),
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const tabBtn = (
    key: "unpaid" | "paid",
    label: string,
    icon: React.ComponentType<any>,
  ) => {
    const active = tab === key;
    const Icon = icon;
    return (
      <button
        key={key}
        onClick={() => setTab(key)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border ${
          active
            ? "bg-orange-500 text-white border-orange-500"
            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-orange-300 border-gray-200 dark:border-gray-700"
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  };

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Orders
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View unpaid and paid orders
          </p>
        </div>

        <div className="flex gap-2">
          {tabBtn("unpaid", "Unpaid", Clock)}
          {tabBtn("paid", "Paid", CheckCircle2)}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-4 text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr className="text-left text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3 font-semibold">Order #</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Table / Customer</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200 capitalize">
                        {o.type}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                        {o.table?.name ? o.table.name : o.customer?.name || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(o.total || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                              o.status === "PAID"
                                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                : o.status === "BILLED"
                                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                  : o.status === "SERVED"
                                    ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                                    : "bg-gray-100 dark:bg-gray-600/30 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {o.status}
                          </span>

                          {(user?.role === "MANAGER"||"ADMIN"||"CASHIER") &&
                            (o.status === "SERVED" ||
                              o.status === "BILLED") && (
                              <div className="flex gap-2">
                                {o.status === "SERVED" && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.patch(
                                          `/orders/${o.id}/status`,
                                          { status: "BILLED" },
                                        );
                                        const res = await api.get(
                                          `/orders?status=PAID&page=1&limit=50`,
                                        );
                                        // re-fetch current tab
                                        if (tab === "paid")
                                          setOrders(res.orders || []);
                                        else {
                                          const cur = await api.get(
                                            `/orders?page=1&limit=50`,
                                          );
                                          setOrders(
                                            (cur.orders || []).filter(
                                              (x: OrderRow) =>
                                                x.status !== "PAID",
                                            ),
                                          );
                                        }
                                      } catch (e: any) {
                                        setError(
                                          e?.message ||
                                            "Failed to update status",
                                        );
                                      }
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    Bill
                                  </button>
                                )}

                                {o.status === "BILLED" && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.patch(
                                          `/orders/${o.id}/status`,
                                          { status: "PAID" },
                                        );
                                        if (tab === "paid") {
                                          const res = await api.get(
                                            `/orders?status=PAID&page=1&limit=50`,
                                          );
                                          setOrders(res.orders || []);
                                        } else {
                                          const cur = await api.get(
                                            `/orders?page=1&limit=50`,
                                          );
                                          setOrders(
                                            (cur.orders || []).filter(
                                              (x: OrderRow) =>
                                                x.status !== "PAID",
                                            ),
                                          );
                                        }
                                      } catch (e: any) {
                                        setError(
                                          e?.message ||
                                            "Failed to update status",
                                        );
                                      }
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700"
                                  >
                                    Mark Paid
                                  </button>
                                )}

                                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  Manager
                                </span>
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
