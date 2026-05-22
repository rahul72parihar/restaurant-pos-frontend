"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Plus, Star, Phone, Mail, ShoppingBag } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selected, setSelected]   = useState<any>(null);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState({ name: "", phone: "", email: "" });

  const fetchCustomers = (q = "") =>
    api.get(`/customers?search=${q}`).then((d) => { setCustomers(d.customers); setLoading(false); });

  useEffect(() => { fetchCustomers(); }, []);

  const openCustomer = async (id: string) => {
    const c = await api.get(`/customers/${id}`);
    setSelected(c);
  };

  const addCustomer = async () => {
    if (!form.name || !form.phone) return;
    await api.post("/customers", form);
    setShowAdd(false);
    setForm({ name: "", phone: "", email: "" });
    fetchCustomers();
  };

  return (
    <div className="max-w-6xl flex gap-4 h-[calc(100vh-8rem)]">
      {/* List */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); fetchCustomers(e.target.value); }}
              placeholder="Search by name, phone, email..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
          {loading ? (
            Array.from({length: 8}).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No customers found</div>
          ) : customers.map((c) => (
            <button key={c.id} onClick={() => openCustomer(c.id)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 text-left transition-colors ${selected?.id === c.id ? "bg-orange-50 dark:bg-orange-900/10" : ""}`}>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm shrink-0">
                {c.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{c.name}</p>
                <p className="text-xs text-gray-400 truncate">{c.phone}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(c.totalSpend)}</p>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <Star className="w-3 h-3 fill-current" /> {c.loyaltyPoints}pts
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className="w-80 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b border-gray-100 dark:border-gray-700">
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xs mb-3 block">← Back</button>
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-xl mb-3">
              {selected.name?.[0]?.toUpperCase()}
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white text-lg">{selected.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <Phone className="w-3.5 h-3.5" /> {selected.phone}
            </div>
            {selected.email && (
              <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                <Mail className="w-3.5 h-3.5" /> {selected.email}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
            {[
              { label: "Visits", value: selected.visitCount },
              { label: "Points", value: selected.loyaltyPoints },
              { label: "Spent",  value: formatCurrency(selected.totalSpend) },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 text-center">
                <p className="text-base font-bold text-gray-800 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" /> Recent Orders
            </p>
            <div className="space-y-2">
              {selected.orders?.length === 0 && <p className="text-sm text-gray-400">No orders yet</p>}
              {selected.orders?.slice(0, 10).map((order: any) => (
                <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">#{order.orderNumber}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === "PAID" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-1">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-80 shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 text-sm">
          Select a customer to view details
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Add Customer</h3>
            <div className="space-y-4">
              {[["Name *", "name", "text", "Full name"], ["Phone *", "phone", "tel", "10-digit mobile"], ["Email", "email", "email", "Email address"]].map(([label, key, type, placeholder]) => (
                <div key={key as string}>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{label as string}</label>
                  <input type={type as string} placeholder={placeholder as string}
                    value={(form as any)[key as string]} onChange={(e) => setForm({...form, [key as string]: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={addCustomer} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors">Add Customer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
