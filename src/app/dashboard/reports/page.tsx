"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { IndianRupee, TrendingUp, Receipt, Users } from "lucide-react";

const COLORS = ["#f97316","#3b82f6","#10b981","#8b5cf6","#f59e0b"];

export default function ReportsPage() {
  const [tab, setTab]           = useState("sales");
  const [sales, setSales]       = useState<any>({});
  const [gst, setGst]           = useState<any>({});
  const [topItems, setTopItems] = useState<any[]>([]);
  const [staff, setStaff]       = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [range, setRange]       = useState("30");

  useEffect(() => {
    const from = new Date(Date.now() - parseInt(range) * 86400000).toISOString().split("T")[0];
    setLoading(true);
    Promise.all([
      api.get(`/reports/sales?from=${from}`),
      api.get(`/reports/gst?from=${from}`),
      api.get(`/reports/items?from=${from}`),
      api.get(`/reports/staff?from=${from}`),
      api.get(`/reports/payment-methods?from=${from}`),
    ]).then(([s, g, ti, st, pm]) => {
      setSales(s); setGst(g); setTopItems(ti); setStaff(st); setPayments(pm);
    }).finally(() => setLoading(false));
  }, [range]);

  const tabs = [
    { id: "sales",    label: "Sales" },
    { id: "gst",      label: "GST Report" },
    { id: "items",    label: "Top Items" },
    { id: "staff",    label: "Staff" },
    { id: "payments", label: "Payments" },
  ];

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-orange-500 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)}
          className="ml-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">Loading reports...</div>
      ) : (
        <>
          {/* Sales Tab */}
          {tab === "sales" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:"Total Revenue", value: formatCurrency(sales.total || 0),       icon: IndianRupee },
                  { label:"Total Orders",  value: sales.totalOrders || 0,                  icon: Receipt },
                  { label:"Total GST",     value: formatCurrency(sales.totalGst || 0),     icon: TrendingUp },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-1">
                      <Icon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Daily Revenue</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sales.data || []} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Bar dataKey="revenue" fill="#f97316" radius={[6,6,0,0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* GST Tab */}
          {tab === "gst" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label:"Taxable Amount", value: formatCurrency(gst.summary?.taxableAmount || 0) },
                  { label:"CGST (2.5%)",    value: formatCurrency(gst.summary?.cgst || 0) },
                  { label:"SGST (2.5%)",    value: formatCurrency(gst.summary?.sgst || 0) },
                  { label:"Total GST",      value: formatCurrency(gst.summary?.totalGst || 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Invoice-wise GST</h3>
                </div>
                <div className="overflow-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-4 py-3">Order No.</th>
                        <th className="text-right px-4 py-3">Taxable</th>
                        <th className="text-right px-4 py-3">GST</th>
                        <th className="text-right px-4 py-3">Total</th>
                        <th className="text-left px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {(gst.orders || []).slice(0, 50).map((o: any) => (
                        <tr key={o.orderNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-300">{o.orderNumber}</td>
                          <td className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-300">{formatCurrency(o.subtotal)}</td>
                          <td className="px-4 py-2.5 text-right text-orange-600">{formatCurrency(o.gstAmt)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(o.total)}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Top Items Tab */}
          {tab === "items" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Top Items by Quantity</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topItems.slice(0,10)} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="qtySold" fill="#f97316" radius={[0,6,6,0]} name="Qty Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Top Items Table</h3>
                <div className="space-y-2">
                  {topItems.slice(0, 10).map((item, i) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category?.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{item.qtySold} sold</p>
                        <p className="text-xs text-orange-500">{formatCurrency(item.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {tab === "staff" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Staff Performance</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Staff Member</th>
                    <th className="text-center px-4 py-3">Role</th>
                    <th className="text-right px-4 py-3">Orders</th>
                    <th className="text-right px-5 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                            {s.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-100">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                          {s.role?.replace("_"," ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">{s.orderCount}</td>
                      <td className="px-5 py-3 text-right font-bold text-orange-600">{formatCurrency(s.revenue || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments Tab */}
          {tab === "payments" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Payment Method Split</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={payments} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={90} label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`} labelLine>
                      {payments.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Method Breakdown</h3>
                <div className="space-y-3">
                  {payments.map((p: any, i: number) => (
                    <div key={p.method} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-medium">{p.method}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{p.count} txns</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(p.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
