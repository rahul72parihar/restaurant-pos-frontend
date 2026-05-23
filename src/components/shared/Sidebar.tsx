"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard, ShoppingCart, Grid2X2, UtensilsCrossed,
  BookOpen, Package, Users, BarChart3, Settings, ChefHat,
  LogOut, Store, Tag, QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

const allLinks = [
  { href: "/dashboard",           label: "Dashboard",   icon: LayoutDashboard, roles: ["ADMIN","MANAGER","CASHIER"] },
  { href: "/dashboard/pos",       label: "POS / Billing",icon: ShoppingCart,   roles: ["ADMIN","MANAGER","CASHIER"] },
  { href: "/dashboard/tables",    label: "Tables",      icon: Grid2X2,         roles: ["ADMIN","MANAGER","WAITER","CASHIER"] },
  { href: "/dashboard/kitchen",   label: "Kitchen",     icon: UtensilsCrossed, roles: ["ADMIN","MANAGER","KITCHEN_STAFF"] },
  { href: "/dashboard/orders",    label: "Orders",      icon: ShoppingCart,    roles: ["ADMIN","MANAGER","CASHIER"] },
  { href: "/dashboard/menu",      label: "Menu",        icon: BookOpen,        roles: ["ADMIN","MANAGER"] },
  { href: "/dashboard/inventory", label: "Inventory",   icon: Package,         roles: ["ADMIN","MANAGER"] },
  { href: "/dashboard/customers", label: "Customers",   icon: Users,           roles: ["ADMIN","MANAGER","CASHIER"] },
  { href: "/dashboard/reports",   label: "Reports",     icon: BarChart3,       roles: ["ADMIN","MANAGER"] },
  { href: "/dashboard/coupons",   label: "Coupons",     icon: Tag,             roles: ["ADMIN","MANAGER"] },
  { href: "/dashboard/outlets",   label: "Outlets",     icon: Store,           roles: ["ADMIN"] },
  { href: "/dashboard/settings",  label: "Settings",    icon: Settings,        roles: ["ADMIN","MANAGER"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const links = allLinks.filter((l) => !user || l.roles.includes(user.role));

  return (
    <aside className="w-60 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate">Restaurant POS</p>
          <p className="text-xs text-gray-400 truncate">{user?.outlet?.name || "Main Outlet"}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              )}>
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
