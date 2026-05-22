"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Users, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  AVAILABLE: { color: "text-green-700 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",  label: "Available", icon: CheckCircle2 },
  OCCUPIED:  { color: "text-red-700 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",          label: "Occupied",  icon: Users },
  RESERVED:  { color: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",      label: "Reserved",  icon: Clock },
  CLEANING:  { color: "text-yellow-700 dark:text-yellow-400",bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",label:"Cleaning",  icon: AlertCircle },
};

export default function TablesPage() {
  const [tables, setTables]       = useState<any[]>([]);
  const [section, setSection]     = useState("all");
  const [selected, setSelected]   = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const socket = useSocket();

  const fetchTables = () =>
    api.get("/tables").then((data) => { setTables(data); setLoading(false); });

  useEffect(() => { fetchTables(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("table:updated", () => fetchTables());
    socket.on("order:created", () => fetchTables());
    return () => { socket.off("table:updated"); socket.off("order:created"); };
  }, [socket]);

  const sections = ["all", ...new Set(tables.map((t) => t.section))];
  const filtered = section === "all" ? tables : tables.filter((t) => t.section === section);

  const changeStatus = async (id: string, status: string) => {
    await api.patch(`/tables/${id}/status`, { status });
    fetchTables();
    setSelected(null);
  };

  return (
    <div className="max-w-6xl space-y-4">
      {/* Section filter */}
      <div className="flex items-center gap-3 flex-wrap">
        {sections.map((s) => (
          <button key={s} onClick={() => setSection(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${section === s ? "bg-orange-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300"}`}>
            {s === "all" ? "All Sections" : s}
          </button>
        ))}
        <div className="ml-auto flex gap-2 text-xs text-gray-400">
          {Object.entries(statusConfig).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${v.bg.split(" ")[0].replace("bg-", "bg-")}`} />{v.label}</span>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((table) => {
            const cfg = statusConfig[table.status] || statusConfig.AVAILABLE;
            const Icon = cfg.icon;
            const activeOrder = table.orders?.[0];
            return (
              <button key={table.id} onClick={() => setSelected(table)}
                className={`p-3 rounded-2xl border-2 text-left transition-all hover:scale-105 ${cfg.bg}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{table.section}</span>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{table.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Users className="w-3 h-3" />{table.capacity}</p>
                {activeOrder && (
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-1.5 truncate">
                    {formatCurrency(activeOrder.total)}
                  </p>
                )}
                <p className={`text-xs font-medium mt-1 ${cfg.color}`}>{cfg.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Table Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selected.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selected.section} • Capacity: {selected.capacity}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Active Order */}
            {selected.orders?.[0] && (
              <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2">Active Order</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">#{selected.orders[0].orderNumber}</p>
                <p className="text-sm font-bold text-orange-600">{formatCurrency(selected.orders[0].total)}</p>
                <p className="text-xs text-gray-400 capitalize">{selected.orders[0].status.toLowerCase()}</p>
              </div>
            )}

            {/* Status Actions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Change Status</p>
              {Object.entries(statusConfig).map(([status, cfg]) => (
                <button key={status} onClick={() => changeStatus(selected.id, status)}
                  disabled={selected.status === status}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${cfg.bg} ${cfg.color}`}>
                  <cfg.icon className="w-4 h-4" />
                  {cfg.label}
                  {selected.status === status && <span className="ml-auto text-xs">(Current)</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
