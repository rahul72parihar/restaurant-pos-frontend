"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { ChefHat, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("admin@pos.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", { email, password });
      setAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      Admin:   { email: "admin@pos.com",   password: "admin123"   },
      Manager: { email: "manager@pos.com", password: "manager123" },
      Cashier: { email: "cashier@pos.com", password: "cashier123" },
      Waiter:  { email: "waiter@pos.com",  password: "waiter123"  },
      Kitchen: { email: "kitchen@pos.com", password: "kitchen123" },
    };
    if (creds[role]) { setEmail(creds[role].email); setPassword(creds[role].password); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg">
            <ChefHat className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurant POS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 pr-12"
                  placeholder="Enter password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 text-center mb-3">Quick login (demo)</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Admin", "Manager", "Cashier", "Waiter", "Kitchen"].map((role) => (
                <button key={role} onClick={() => quickLogin(role)}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-600 dark:text-gray-300 rounded-lg transition-colors">
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
