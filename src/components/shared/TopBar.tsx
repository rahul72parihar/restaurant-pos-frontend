"use client";
import { usePathname } from "next/navigation";
import { Sun, Moon, Bell, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

const titles: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/dashboard/pos":        "POS / Billing",
  "/dashboard/tables":     "Table Management",
  "/dashboard/kitchen":    "Kitchen Display",
  "/dashboard/menu":       "Menu Management",
  "/dashboard/inventory":  "Inventory",
  "/dashboard/customers":  "Customers",
  "/dashboard/reports":    "Reports & Analytics",
  "/dashboard/coupons":    "Coupons",
  "/dashboard/outlets":    "Outlets",
  "/dashboard/settings":   "Settings",
};

export default function TopBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const title = titles[pathname] || "Restaurant POS";

  return (
    <header className="h-14 shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 gap-4">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-white flex-1">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
          {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications bell */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors relative">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
