"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, ToggleLeft, ToggleRight, Edit2 } from "lucide-react";

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems]           = useState<any[]>([]);
  const [filtered, setFiltered]     = useState<any[]>([]);
  const [activeCat, setActiveCat]   = useState("all");
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [form, setForm]             = useState({ name: "", price: "", categoryId: "", description: "", isVeg: "true", gstRate: "5" });
  const [saving, setSaving]         = useState(false);

  const fetchData = () =>
    Promise.all([api.get("/menu/categories"), api.get("/menu/items")]).then(([cats, its]) => {
      setCategories(cats);
      setItems(its);
      setFiltered(its);
      setLoading(false);
    });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let f = items;
    if (activeCat !== "all") f = f.filter((i: any) => i.category?.id === activeCat);
    if (search) f = f.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [activeCat, search, items]);

  const toggleItem = async (id: string) => {
    await api.patch(`/menu/items/${id}/toggle`, {});
    fetchData();
  };

  const addItem = async () => {
    if (!form.name || !form.price || !form.categoryId) return;
    setSaving(true);
    try {
      await api.post("/menu/items", { ...form, price: parseFloat(form.price), isVeg: form.isVeg === "true", gstRate: parseFloat(form.gstRate) });
      setShowAdd(false);
      setForm({ name: "", price: "", categoryId: "", description: "", isVeg: "true", gstRate: "5" });
      fetchData();
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCat("all")}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCat === "all" ? "bg-orange-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"}`}>
          All ({items.length})
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveCat(c.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCat === c.id ? "bg-orange-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"}`}>
            {c.name} ({c._count?.menuItems || 0})
          </button>
        ))}
      </div>

      {/* Items table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <th className="text-left px-4 py-3">Item</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-center px-4 py-3">GST</th>
              <th className="text-center px-4 py-3">Type</th>
              <th className="text-center px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {loading ? (
              Array.from({length: 8}).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800 dark:text-gray-100">{item.name}</p>
                  {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.description}</p>}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.category?.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(item.price)}</td>
                <td className="px-4 py-3 text-center text-gray-500">{item.gstRate}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isVeg ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                    {item.isVeg ? "Veg" : "Non-Veg"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleItem(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${item.isAvailable ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200" : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200"}`}>
                    {item.isAvailable ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No items found</div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Add Menu Item</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Item Name *</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">GST Rate (%)</label>
                  <select value={form.gstRate} onChange={(e) => setForm({...form, gstRate: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                    <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Category *</label>
                <select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Type</label>
                <div className="flex gap-3">
                  {[["true","🟢 Veg"],["false","🔴 Non-Veg"]].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={v} checked={form.isVeg === v} onChange={(e) => setForm({...form, isVeg: e.target.value})} className="accent-orange-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={addItem} disabled={saving}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                {saving ? "Saving..." : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
