"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Tag, CheckCircle2, XCircle, Percent, IndianRupee } from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({
    code: "", type: "PERCENT", value: "", minOrder: "0",
    maxUses: "", validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  });

  const fetchCoupons = () => api.get("/coupons").then(setCoupons).finally(() => setLoading(false));
  useEffect(() => { fetchCoupons(); }, []);

  const save = async () => {
    if (!form.code || !form.value) return;
    setSaving(true);
    try {
      await api.post("/coupons", {
        ...form,
        value: parseFloat(form.value),
        minOrder: parseFloat(form.minOrder) || 0,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        validFrom: new Date(form.validFrom),
        validUntil: new Date(form.validUntil),
      });
      setShowAdd(false);
      setForm({ code: "", type: "PERCENT", value: "", minOrder: "0", maxUses: "", validFrom: new Date().toISOString().split("T")[0], validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] });
      fetchCoupons();
    } finally { setSaving(false); }
  };

  const toggle = async (id: string, isActive: boolean) => {
    await api.patch(`/coupons/${id}`, { isActive: !isActive });
    fetchCoupons();
  };

  const now = new Date();

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{coupons.length} coupons total</p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No coupons created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => {
            const expired  = new Date(c.validUntil) < now;
            const notYet   = new Date(c.validFrom)  > now;
            const maxed    = c.maxUses && c.usedCount >= c.maxUses;
            const active   = c.isActive && !expired && !notYet && !maxed;
            const usePct   = c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : 0;

            return (
              <div key={c.id} className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 p-5 transition-all ${active ? "border-orange-200 dark:border-orange-800" : "border-gray-100 dark:border-gray-700 opacity-70"}`}>
                {/* Dashed divider (coupon look) */}
                <div className="absolute top-1/2 -left-px w-3 h-6 bg-gray-50 dark:bg-gray-900 rounded-r-full -translate-y-1/2 border-r-2 border-dashed border-gray-200 dark:border-gray-700" />
                <div className="absolute top-1/2 -right-px w-3 h-6 bg-gray-50 dark:bg-gray-900 rounded-l-full -translate-y-1/2 border-l-2 border-dashed border-gray-200 dark:border-gray-700" />

                <div className="flex items-start justify-between mb-3">
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold tracking-widest ${active ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>
                    {c.code}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                    {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {expired ? "Expired" : notYet ? "Upcoming" : maxed ? "Maxed out" : active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    {c.type === "PERCENT" ? <Percent className="w-5 h-5 text-orange-500" /> : <IndianRupee className="w-5 h-5 text-orange-500" />}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {c.type === "PERCENT" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </p>
                    <p className="text-xs text-gray-400">Min. order: {formatCurrency(c.minOrder)}</p>
                  </div>
                </div>

                {c.maxUses && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Used {c.usedCount} / {c.maxUses}</span>
                      <span>{usePct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${usePct}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-dashed border-gray-100 dark:border-gray-700">
                  <span>Valid till {formatDate(c.validUntil)}</span>
                  <button onClick={() => toggle(c.id, c.isActive)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${c.isActive ? "bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100" : "bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100"}`}>
                    {c.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Create Coupon</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Coupon Code *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Discount Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Value *</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "PERCENT" ? "e.g. 20" : "e.g. 50"}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Min. Order (₹)</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Max Uses (blank = unlimited)</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                {saving ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
