"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import { useSocket } from "@/hooks/useSocket";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { isAuthenticated, token } = useAuthStore();

  const [hydrated, setHydrated] = useState(false);

  useSocket();

  // Wait for Zustand persist hydration
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsub();
    };
  }, []);

  // Redirect only AFTER hydration
  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !token) {
      router.replace("/auth/login");
    }
  }, [hydrated, isAuthenticated, token, router]);

  // Prevent flicker
  if (!hydrated) {
    return null;
  }

  // Prevent rendering protected UI
  if (!isAuthenticated || !token) {
    return null;
  }

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