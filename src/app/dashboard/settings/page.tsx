"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ChefHat, User, Bell, Printer, Globe, Shield } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
    {children}
  </div>
);

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <div>{children}</div>
  </div>
);

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-600"}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5.5" : "left-0.5"}`} style={{ left: value ? "22px" : "2px" }} />
  </button>
);

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [notif, setNotif]   = useState({ newOrder: true, lowStock: true, kotReady: true, payment: false });
  const [printer, setPrinter] = useState({ autoPrint: true, thermalWidth: "80", copies: "1" });
  const [gst, setGst]       = useState({ cgst: "2.5", sgst: "2.5", serviceCharge: "0" });
  const [saved, setSaved]   = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </div>
        <Row label="Name"><input defaultValue={user?.name} className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 w-44" /></Row>
        <Row label="Email"><input defaultValue={user?.email} className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 w-44" /></Row>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Theme" desc="Choose your preferred color theme">
          <div className="flex gap-2">
            {[["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]].map(([v, l, Icon]: any) => (
              <button key={v} onClick={() => setTheme(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${theme === v ? "bg-orange-500 border-orange-500 text-white" : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-orange-300"}`}>
                <Icon className="w-3.5 h-3.5" />{l}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        {[
          { key: "newOrder",  label: "New Order Alert",   desc: "Get notified on every new order" },
          { key: "lowStock",  label: "Low Stock Alert",   desc: "Alert when inventory is running low" },
          { key: "kotReady",  label: "KOT Ready",         desc: "Notify when kitchen marks order ready" },
          { key: "payment",   label: "Payment Received",  desc: "Alert on successful payment" },
        ].map(({ key, label, desc }) => (
          <Row key={key} label={label} desc={desc}>
            <Toggle value={(notif as any)[key]} onChange={() => setNotif((p) => ({ ...p, [key]: !(p as any)[key] }))} />
          </Row>
        ))}
      </Section>

      {/* GST Settings */}
      <Section title="GST & Tax Settings">
        <div className="grid grid-cols-3 gap-4">
          {[["CGST Rate (%)", "cgst"], ["SGST Rate (%)", "sgst"], ["Service Charge (%)", "serviceCharge"]].map(([l, k]) => (
            <div key={k as string}>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{l as string}</label>
              <input type="number" value={(gst as any)[k as string]} onChange={(e) => setGst({ ...gst, [k as string]: e.target.value })} step="0.5"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          ))}
        </div>
      </Section>

      {/* Printer */}
      <Section title="Printer Settings">
        <Row label="Auto-print KOT" desc="Automatically print KOT when order is placed">
          <Toggle value={printer.autoPrint} onChange={() => setPrinter((p) => ({ ...p, autoPrint: !p.autoPrint }))} />
        </Row>
        <Row label="Thermal Printer Width">
          <select value={printer.thermalWidth} onChange={(e) => setPrinter({ ...printer, thermalWidth: e.target.value })}
            className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="58">58mm</option>
            <option value="80">80mm</option>
          </select>
        </Row>
        <Row label="Receipt Copies">
          <select value={printer.copies} onChange={(e) => setPrinter({ ...printer, copies: e.target.value })}
            className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
            {["1", "2", "3"].map((v) => <option key={v} value={v}>{v} cop{v === "1" ? "y" : "ies"}</option>)}
          </select>
        </Row>
      </Section>

      {/* Save button */}
      <div className="flex justify-end">
        <button onClick={handleSave}
          className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
