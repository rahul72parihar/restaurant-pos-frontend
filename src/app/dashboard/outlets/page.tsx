"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Store, Plus, MapPin, Phone, Receipt, Users, Grid2X2 } from "lucide-react";

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ name: "", address: "", phone: "", gstNumber: "" });

  const fetch = () => api.get("/outlets").then(setOutlets).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    try { await api.post("/outlets", form); setShowAdd(false); setForm({ name: "", address: "", phone: "", gstNumber: "" }); fetch(); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{outlets.length} outlet{outlets.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Outlet
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outlets.map((o) => (
            <div key={o.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{o.name}</h3>
                  <div className="flex items-start gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="leading-tight">{o.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{o.phone}</span>
                  </div>
                  {o.gstNumber && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                      <Receipt className="w-3 h-3 shrink-0" />
                      <span className="font-mono">{o.gstNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                {[
                  { label: "Tables",  count: o._count?.tables,  icon: Grid2X2 },
                  { label: "Orders",  count: o._count?.orders,  icon: Receipt },
                  { label: "Staff",   count: o._count?.users,   icon: Users   },
                ].map(({ label, count, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{count ?? 0}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${o.isActive ? "bg-green-400" : "bg-gray-300"}`} />
                <span className="text-xs text-gray-400">{o.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Add New Outlet</h3>
            <div className="space-y-4">
              {[["Outlet Name *", "name", "e.g. The Grand Kitchen - MG Road"], ["Address *", "address", "Full address"], ["Phone *", "phone", "Contact number"], ["GST Number", "gstNumber", "29AABCT1332L1ZT"]].map(([l, k, p]) => (
                <div key={k as string}>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{l as string}</label>
                  <input value={(form as any)[k as string]} onChange={(e) => setForm({ ...form, [k as string]: e.target.value })} placeholder={p as string}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold">
                {saving ? "Saving..." : "Add Outlet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
