"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void }>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

const icons = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const colors = {
  success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
  error:   "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
  warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
  info:    "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  // Expose globally
  useEffect(() => {
    (window as any).__toast = toast;
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto animate-in slide-in-from-right-5 ${colors[t.type]}`}>
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{t.message}</p>
              <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
