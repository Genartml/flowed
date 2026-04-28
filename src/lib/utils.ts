import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateRunway(funds: number, burn: number, baselineOverhead: number = 0): number {
  const effectiveBurn = Math.max(burn, baselineOverhead);
  if (effectiveBurn <= 0) return 99.9;
  return Math.round((funds / effectiveBurn) * 10) / 10;
}

export function calculateRevenueGap(burn: number, income: number): number {
  if (income >= burn) return 0;
  return burn - income;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getRunwayStatus(
  months: number
): "Healthy" | "Caution" | "Critical" {
  if (months >= 6) return "Healthy";
  if (months >= 3) return "Caution";
  return "Critical";
}

export function getEntityLabel(entity: string): string {
  return entity === "primary" ? "Business" : "Personal Brand";
}
