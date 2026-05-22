"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Plus, AlertTriangle, Package, Search, TrendingDown, TrendingUp, ShoppingCart } from "lucide-react";

type Tab = "items" | "purchases" | "suppliers" | "wastage";

export default function InventoryPage() {
  const [tab, setTab]             = useState<Tab>("items");
  const [items, setItems]         = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [wastage, setWastage]     = useState<any[]>([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  // Modals
  const [showAddItem, setShowAddItem]     = useState(false);
  const [showAdjust, setShowAdjust]       = useState<any>(null);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showPurchase, setShowPurchase]   = useState(false);

  const [itemForm, setItemForm]     = useState({ name: "", unit: "kg", currentStock: "", minStock: "", costPerUnit: "", supplierId: "" });
  const [adjustForm, setAdjustForm] = useState({ qty: "", reason: "", type: "add" });
  const [supForm, setSupForm]       = useState({ name: "", phone: "", email: "", address: "" });

  // Use first outlet from auth — hardcoded for demo; in prod pull from authStore
  const OUTLET_ID = "outlet-1";

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get(`/inventory?outletId=${OUTLET_ID}`),
      api.get("/inventory/purchases"),
      api.get("/inventory/suppliers"),
      api.get("/inventory/wastage"),
    ]).then(([inv, pur, sup, was]) => {
      setItems(inv);
      setPurchases(pur);
      setSuppliers(sup);
      setWastage(was);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const saveItem = async () => {
    await api.post("/inventory", { ...itemForm, outletId: OUTLET_ID, currentStock: parseFloat(itemForm.currentStock) || 0, minStock: parseFloat(itemForm.minStock) || 0, costPerUnit: parseFloat(itemForm.costPerUnit) || 0 });
    setShowAddItem(false);
    setItemForm({ name: "", unit: "kg", currentStock: "", minStock: "", costPerUnit: "", supplierId: "" });
    fetchAll();
  };

  const doAdjust = async () => {
    await api.post(`/inventory/${showAdjust.id}/adjust`, { ...adjustForm, qty: parseFloat(adjustForm.qty) });
    setShowAdjust(null);
    setAdjustForm({ qty: "", reason: "", type: "add" });
    fetchAll();
  };

  const saveSupplier = async () => {
    await api.post("/inventory/suppliers", supForm);
    setShowAddSupplier(false);
    setSupForm({ name: "", phone: "", email: "", address: "" });
    fetchAll();
  };

  const lowStockCount = items.filter((i) => i.isLowStock).length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "items",     label: "Inventory Items", count: items.length },
    { id: "purchases", label: "Purchases",        count: purchases.length },
    { id: "suppliers", label: "Suppliers",        count: suppliers.length },
    { id: "wastage",   label: "Wastage Log",      count: wastage.length },
  ];

  return (
    <div className="max-w-6xl space-y-4">
      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            {lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low on stock
          </p>
        </div>
      )}

      {/* Tabs + Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-orange-500 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              {t.label}
              {t.count !== undefined && <span className="ml-1.5 text-xs opacity-70">({t.count})</span>}
            </button>
          ))}
        </div>

        {tab === "items" && (
          <button onClick={() => setShowAddItem(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        )}
        {tab === "suppliers" && (
          <button onClick={() => setShowAddSupplier(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        )}
        {tab === "purchases" && (
          <button onClick={() => setShowPurchase(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
            <ShoppingCart className="w-4 h-4" /> New Purchase
          </button>
        )}
      </div>

      {/* ── Items Tab ──────────────────────────────────────────────────────────── */}
      {tab === "items" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Item</th>
                <th className="text-center px-4 py-3">Unit</th>
                <th className="text-right px-4 py-3">Current Stock</th>
                <th className="text-right px-4 py-3">Min Stock</th>
                <th className="text-right px-4 py-3">Cost/Unit</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td></tr>
              )) : filteredItems.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${item.isLowStock ? "bg-amber-50/50 dark:bg-amber-900/5" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <Package className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{item.name}</p>
                        {item.supplier && <p className="text-xs text-gray-400">{item.supplier.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{item.unit}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${item.isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-100"}`}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{item.minStock}</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatCurrency(item.costPerUnit)}</td>
                  <td className="px-4 py-3 text-center">
                    {item.isLowStock
                      ? <span className="flex items-center justify-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-medium"><AlertTriangle className="w-3 h-3" />Low Stock</span>
                      : <span className="text-xs text-green-600 dark:text-green-400 font-medium">OK</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setShowAdjust(item)}
                      className="px-3 py-1.5 text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 rounded-lg transition-colors">
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Purchases Tab ─────────────────────────────────────────────────────── */}
      {tab === "purchases" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-4 py-3">Supplier</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-right px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {purchases.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">No purchases yet</td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300 text-xs">{new Date(p.purchasedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{p.supplier?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {p.items?.map((i: any) => `${i.inventoryItem?.name} (${i.qty}${i.inventoryItem?.unit})`).join(", ")}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-orange-600">{formatCurrency(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Suppliers Tab ─────────────────────────────────────────────────────── */}
      {tab === "suppliers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-3">
                <span className="text-orange-600 font-bold">{s.name?.[0]?.toUpperCase()}</span>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{s.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.phone}</p>
              {s.email && <p className="text-xs text-gray-400 mt-0.5">{s.email}</p>}
              {s.address && <p className="text-xs text-gray-400 mt-0.5">{s.address}</p>}
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                <span>{s._count?.inventory || 0} items</span>
                <span>{s._count?.purchases || 0} purchases</span>
              </div>
            </div>
          ))}
          {suppliers.length === 0 && <p className="text-gray-400 text-sm col-span-3 text-center py-12">No suppliers added</p>}
        </div>
      )}

      {/* ── Wastage Tab ───────────────────────────────────────────────────────── */}
      {tab === "wastage" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Item</th>
                <th className="text-right px-4 py-3">Qty Lost</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="text-left px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {wastage.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">No wastage logged</td></tr>
              ) : wastage.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{w.inventoryItem?.name}</td>
                  <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">-{w.qty} {w.inventoryItem?.unit}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{w.reason || "—"}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(w.loggedAt).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Item Modal ────────────────────────────────────────────────────── */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddItem(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Add Inventory Item</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Item Name *</label>
                <input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Unit</label>
                  <select value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                    {["kg", "gram", "litre", "ml", "pcs", "dozen", "packet", "box"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Cost / Unit (₹)</label>
                  <input type="number" value={itemForm.costPerUnit} onChange={(e) => setItemForm({ ...itemForm, costPerUnit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Current Stock</label>
                  <input type="number" value={itemForm.currentStock} onChange={(e) => setItemForm({ ...itemForm, currentStock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Min Stock (Alert)</label>
                  <input type="number" value={itemForm.minStock} onChange={(e) => setItemForm({ ...itemForm, minStock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Supplier (optional)</label>
                <select value={itemForm.supplierId} onChange={(e) => setItemForm({ ...itemForm, supplierId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm">
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddItem(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={saveItem} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors">Save Item</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Adjust Stock Modal ────────────────────────────────────────────────── */}
      {showAdjust && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAdjust(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Adjust Stock</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{showAdjust.name} — Current: <b>{showAdjust.currentStock} {showAdjust.unit}</b></p>
            <div className="space-y-4">
              <div className="flex gap-3">
                {[["add", "Add Stock", TrendingUp], ["remove", "Remove / Wastage", TrendingDown]].map(([v, l, Icon]: any) => (
                  <button key={v} onClick={() => setAdjustForm({ ...adjustForm, type: v })}
                    className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-colors text-xs font-medium gap-1 ${adjustForm.type === v ? (v === "add" ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700" : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700") : "border-gray-200 dark:border-gray-600 text-gray-500"}`}>
                    <Icon className="w-5 h-5" />{l}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Quantity ({showAdjust.unit})</label>
                <input type="number" value={adjustForm.qty} onChange={(e) => setAdjustForm({ ...adjustForm, qty: e.target.value })} placeholder="Enter quantity"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>
              {adjustForm.type === "remove" && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Reason</label>
                  <input value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} placeholder="e.g. Expired, spilled..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdjust(null)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={doAdjust} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors">Update Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Supplier Modal ────────────────────────────────────────────────── */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddSupplier(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">Add Supplier</h3>
            <div className="space-y-4">
              {[["Name *", "name"], ["Phone *", "phone"], ["Email", "email"], ["Address", "address"]].map(([l, k]) => (
                <div key={k as string}>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{l as string}</label>
                  <input value={(supForm as any)[k as string]} onChange={(e) => setSupForm({ ...supForm, [k as string]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddSupplier(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={saveSupplier} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors">Save Supplier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
