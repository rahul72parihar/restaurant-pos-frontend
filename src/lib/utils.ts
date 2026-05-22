import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export const calculateGST = (amount: number, rate = 5) => ({
  base: amount,
  gst: parseFloat(((amount * rate) / 100).toFixed(2)),
  cgst: parseFloat(((amount * rate) / 200).toFixed(2)),
  sgst: parseFloat(((amount * rate) / 200).toFixed(2)),
  total: parseFloat((amount + (amount * rate) / 100).toFixed(2)),
});
