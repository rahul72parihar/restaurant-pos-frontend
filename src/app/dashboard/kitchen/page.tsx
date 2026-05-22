"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import { ChefHat, Clock, CheckCircle2, Flame, AlertTriangle } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

const statusColors: Record<string, string> = {
  PENDING:      "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10",
  ACKNOWLEDGED: "border-blue-400 bg-blue-50 dark:bg-blue-900/10",
  PREPARING:    "border-orange-400 bg-orange-50 dark:bg-orange-900/10",
  READY:        "border-green-400 bg-green-50 dark:bg-green-900/10",
};

const nextStatus: Record<string, string> = {
  PENDING:      "ACKNOWLEDGED",
  ACKNOWLEDGED: "PREPARING",
  PREPARING:    "READY",
  READY:        "DELIVERED",
};

const statusLabel: Record<string, string> = {
  PENDING:      "Acknowledge",
  ACKNOWLEDGED: "Start Cooking",
  PREPARING:    "Mark Ready",
  READY:        "Delivered",
};

const elapsed = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  return m < 1 ? "Just now" : `${m}m ago`;
};

export default function KitchenPage() {
  const [kots, setKots] = useState<any[]>([]);
  const socket = useSocket();

  const fetchKots = () => api.get("/kot").then(setKots);

  useEffect(() => { fetchKots(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("kot:new",     () => fetchKots());
    socket.on("kot:updated", () => fetchKots());
    return () => { socket.off("kot:new"); socket.off("kot:updated"); };
  }, [socket]);

  const updateKot = async (id: string, status: string) => {
    await api.patch(`/kot/${id}/status`, { status });
    fetchKots();
  };

  const columns = ["PENDING", "PREPARING", "READY"];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
          <ChefHat className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Kitchen Display</span>
        </div>
        <span className="text-sm text-gray-400">{kots.length} active orders</span>
        <button onClick={fetchKots} className="ml-auto text-xs text-gray-400 hover:text-orange-500 transition-colors">↻ Refresh</button>
      </div>

      {/* KOT Board */}
      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {columns.map((col) => {
          const colKots = kots.filter((k) => k.status === col || (col === "PENDING" && k.status === "ACKNOWLEDGED"));
          return (
            <div key={col} className="flex flex-col overflow-hidden">
              {/* Column header */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-3 font-semibold text-sm ${
                col === "PENDING"   ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300" :
                col === "PREPARING" ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300" :
                                      "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
              }`}>
                {col === "PENDING" ? <Clock className="w-4 h-4" /> : col === "PREPARING" ? <Flame className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {col === "PENDING" ? "New Orders" : col === "PREPARING" ? "Cooking" : "Ready"}
                <span className="ml-auto bg-white/60 dark:bg-black/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{colKots.length}</span>
              </div>

              {/* KOT Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colKots.length === 0 && (
                  <div className="text-center text-gray-300 dark:text-gray-600 text-sm py-8">No orders</div>
                )}
                {colKots.map((kot) => {
                  const mins = Math.floor((Date.now() - new Date(kot.createdAt).getTime()) / 60000);
                  const isUrgent = mins >= 10;
                  return (
                    <div key={kot.id} className={`kot-card border-2 rounded-2xl p-4 ${statusColors[kot.status]} ${isUrgent ? "border-red-400" : ""}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{kot.kotNumber}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {kot.order?.table ? `Table ${kot.order.table.number}` : kot.order?.type?.replace("_", " ")}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isUrgent ? "bg-red-100 text-red-600" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                          {isUrgent && <AlertTriangle className="w-3 h-3" />}
                          {elapsed(kot.createdAt)}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 mb-3">
                        {kot.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-sm border ${item.menuItem?.isVeg ? "border-green-500 bg-green-100" : "border-red-500 bg-red-100"}`} />
                              <span className="font-medium text-gray-800 dark:text-gray-100">{item.menuItem?.name}</span>
                            </div>
                            <span className="font-bold text-orange-600 dark:text-orange-400">×{item.qty}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action button */}
                      {kot.status !== "DELIVERED" && (
                        <button onClick={() => updateKot(kot.id, nextStatus[kot.status])}
                          className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                            kot.status === "READY" ? "bg-green-500 hover:bg-green-600 text-white" :
                            kot.status === "PREPARING" ? "bg-orange-500 hover:bg-orange-600 text-white" :
                            "bg-yellow-500 hover:bg-yellow-600 text-white"
                          }`}>
                          {statusLabel[kot.status]}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
