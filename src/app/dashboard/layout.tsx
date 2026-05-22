"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import { useSocket } from "@/hooks/useSocket";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  useSocket(); // init socket connection

  useEffect(() => {
    if (!isAuthenticated) router.replace("/auth/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
