"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Users, IndianRupee, ChefHat, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/reports/dashboard"),
      api.get("/reports/sales?groupBy=day"),
    ]).then(([d, s]) => {
      setStats(d);
      setSales(s.data?.slice(-7) || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <ChefHat className="w-10 h-10 text-orange-400 animate-bounce" />
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );

  const kpis = [
    { label: "Today's Revenue",   value: formatCurrency(stats?.todayRevenue || 0),    icon: IndianRupee,  color: "bg-green-50 dark:bg-green-900/20",   iconColor: "text-green-600", change: "+12%" },
    { label: "Orders Today",      value: stats?.todayOrders || 0,                       icon: ShoppingBag,  color: "bg-blue-50 dark:bg-blue-900/20",     iconColor: "text-blue-600",  change: "+5" },
    { label: "Avg Order Value",   value: formatCurrency(stats?.avgOrderValue || 0),    icon: TrendingUp,   color: "bg-purple-50 dark:bg-purple-900/20", iconColor: "text-purple-600",change: "+8%" },
    { label: "Active Tables",     value: stats?.tableStats?.OCCUPIED || 0,             icon: Users,        color: "bg-orange-50 dark:bg-orange-900/20", iconColor: "text-orange-600",change: "" },
  ];

  const tableStatuses = [
    { label: "Available", count: stats?.tableStats?.AVAILABLE || 0, color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", icon: CheckCircle2 },
    { label: "Occupied",  count: stats?.tableStats?.OCCUPIED  || 0, color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",         icon: Users },
    { label: "Reserved",  count: stats?.tableStats?.RESERVED  || 0, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",     icon: Clock },
    { label: "Cleaning",  count: stats?.tableStats?.CLEANING  || 0, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, iconColor, change }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                {change && <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{change} from yesterday</p>}
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Revenue (Last 7 Days)</h3>
          {sales.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sales} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} labelStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Table Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Table Status</h3>
          <div className="space-y-3">
            {tableStatuses.map(({ label, count, color, icon: Icon }) => (
              <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${color}`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Items */}
      {stats?.topItems?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Top Selling Items Today</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.topItems.map((item: any, i: number) => (
              <div key={item.id} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className="text-2xl font-bold text-orange-500">#{i + 1}</div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-1 leading-tight">{item.name}</p>
                <p className="text-xs text-gray-400 mt-1">{item.qtySold || 0} sold</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
