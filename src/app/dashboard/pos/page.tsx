"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { formatCurrency, calculateGST } from "@/lib/utils";
import { Search, Plus, Minus, Trash2, ChefHat, Printer, CreditCard, Banknote, Smartphone, Tag, User, X, CheckCircle2 } from "lucide-react";

interface MenuItem { id: string; name: string; price: number; isVeg: boolean; isAvailable: boolean; category: { name: string }; }
interface CartItem  { item: MenuItem; qty: number; notes?: string; }

export default function POSPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems]   = useState<MenuItem[]>([]);
  const [filtered, setFiltered]     = useState<MenuItem[]>([]);
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [activeCat, setActiveCat]   = useState("all");
  const [search, setSearch]         = useState("");
  const [orderType, setOrderType]   = useState("DINE_IN");
  const [tableId, setTableId]       = useState("");
  const [tables, setTables]         = useState<any[]>([]);
  const [customer, setCustomer]     = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount]     = useState(0);
  const [couponErr, setCouponErr]   = useState("");
  const [payMethod, setPayMethod]   = useState("CASH");
  const [placing, setPlacing]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/menu/categories"),
      api.get("/menu/items?isAvailable=true"),
      api.get("/tables?status=AVAILABLE"),
    ]).then(([cats, items, tbls]) => {
      setCategories(cats);
      setMenuItems(items);
      setFiltered(items);
      setTables(tbls);
    });
  }, []);

  // Filter
  useEffect(() => {
    let f = menuItems;
    if (activeCat !== "all") f = f.filter((i) => i.category?.name === activeCat);
    if (search) f = f.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [activeCat, search, menuItems]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.item.id === item.id);
      if (ex) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev
      .map((c) => c.item.id === id ? { ...c, qty: c.qty + delta } : c)
      .filter((c) => c.qty > 0)
    );
  };

  const subtotal   = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
  const gstData    = calculateGST(subtotal - discount);
  const total      = gstData.total;

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponErr("");
    try {
      const res = await api.post("/coupons/validate", { code: couponCode, orderAmount: subtotal });
      setDiscount(res.discount);
    } catch (e: any) {
      setCouponErr(e.message);
      setDiscount(0);
    }
  };

  const searchCustomer = async () => {
    if (!phoneSearch.trim()) return;
    try {
      const c = await api.get(`/customers/phone/${phoneSearch}`);
      setCustomer(c);
    } catch { setCustomer(null); }
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
      const order = await api.post("/orders", {
        type: orderType,
        tableId: tableId || null,
        customerId: customer?.id || null,
        items: cart.map((c) => ({ menuItemId: c.item.id, qty: c.qty, notes: c.notes })),
        couponCode: couponCode || null,
      });
      // Auto-send KOT
      await api.post(`/orders/${order.id}/kot`, {
        itemIds: order.items.map((i: any) => i.id),
        kitchen: "Main Kitchen",
      });
      setSuccess(true);
      setCart([]);
      setCouponCode("");
      setDiscount(0);
      setCustomer(null);
      setTableId("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      alert("Order failed: " + e.message);
    } finally {
      setPlacing(false);
    }
  };

  const catNames = ["all", ...new Set(menuItems.map((i) => i.category?.name).filter(Boolean))];

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* ── Left: Menu ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-gray-100 dark:border-gray-700 scrollbar-hide">
          {catNames.map((cat) => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors capitalize ${activeCat === cat ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-50"}`}>
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {filtered.map((item) => {
            const inCart = cart.find((c) => c.item.id === item.id);
            return (
              <button key={item.id} onClick={() => addToCart(item)}
                className="relative p-3 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-orange-300 text-left transition-all group">
                {/* Veg/Non-veg indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 border-2 rounded-sm ${item.isVeg ? "border-green-500" : "border-red-500"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full m-auto mt-0.5 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 pr-5 leading-tight line-clamp-2">{item.name}</p>
                <p className="text-orange-600 dark:text-orange-400 font-bold text-sm mt-1.5">{formatCurrency(item.price)}</p>
                {inCart && (
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {inCart.qty}
                  </div>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-32 text-gray-400 text-sm">No items found</div>
          )}
        </div>
      </div>

      {/* ── Right: Cart ───────────────────────────────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Order type */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 text-xs font-medium">
            {["DINE_IN", "TAKEAWAY", "DELIVERY"].map((t) => (
              <button key={t} onClick={() => setOrderType(t)}
                className={`flex-1 py-2 transition-colors ${orderType === t ? "bg-orange-500 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                {t.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Table select */}
          {orderType === "DINE_IN" && (
            <select value={tableId} onChange={(e) => setTableId(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">Select Table</option>
              {tables.map((t) => <option key={t.id} value={t.id}>{t.name} (Cap: {t.capacity})</option>)}
            </select>
          )}

          {/* Customer */}
          <div className="flex gap-2 mt-2">
            <input value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchCustomer()}
              placeholder="Customer phone..." className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <button onClick={searchCustomer} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-orange-50 transition-colors">
              <User className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          {customer && (
            <div className="flex items-center justify-between mt-1.5 px-2 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-xs text-green-700 dark:text-green-400 font-medium">{customer.name} • {customer.loyaltyPoints}pts</span>
              <button onClick={() => setCustomer(null)}><X className="w-3 h-3 text-green-600" /></button>
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-300 dark:text-gray-600">
              <ChefHat className="w-10 h-10 mb-2" />
              <p className="text-sm">Cart is empty</p>
            </div>
          )}
          {cart.map(({ item, qty }) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-700">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                <p className="text-xs text-orange-500">{formatCurrency(item.price * qty)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-sm font-bold text-gray-800 dark:text-gray-100">{qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="px-4 pb-2">
          <div className="flex gap-2">
            <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setDiscount(0); setCouponErr(""); }}
              placeholder="Coupon code" className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase" />
            <button onClick={validateCoupon} className="px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-medium hover:bg-orange-600 transition-colors">
              Apply
            </button>
          </div>
          {couponErr && <p className="text-red-500 text-xs mt-1">{couponErr}</p>}
          {discount > 0 && <p className="text-green-600 text-xs mt-1">✓ Discount: -{formatCurrency(discount)}</p>}
        </div>

        {/* Bill Summary */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
          <div className="flex justify-between"><span>CGST (2.5%)</span><span>{formatCurrency(gstData.cgst)}</span></div>
          <div className="flex justify-between"><span>SGST (2.5%)</span><span>{formatCurrency(gstData.sgst)}</span></div>
          <div className="flex justify-between font-bold text-sm text-gray-800 dark:text-gray-100 pt-1 border-t border-gray-100 dark:border-gray-700">
            <span>Total</span><span className="text-orange-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="px-4 pb-2 flex gap-2">
          {[["CASH", Banknote], ["UPI", Smartphone], ["CARD", CreditCard]].map(([m, Icon]: any) => (
            <button key={m} onClick={() => setPayMethod(m)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-colors border ${payMethod === m ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-orange-300"}`}>
              <Icon className="w-4 h-4 mb-0.5" />
              {m}
            </button>
          ))}
        </div>

        {/* Place Order */}
        <div className="p-4 pt-0">
          {success ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5" /> Order Placed & KOT Sent!
            </div>
          ) : (
            <button onClick={placeOrder} disabled={!cart.length || placing}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              {placing ? "Placing..." : `Place Order • ${formatCurrency(total)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
