"use client";

import { cn } from "@/lib/utils";

interface LabelPillProps {
  label: "Invest" | "Maintain" | "Cut";
}

export function LabelPill({ label }: LabelPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full border shadow-sm",
        label === "Invest" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
        label === "Maintain" && "bg-zinc-800 text-zinc-300 border-zinc-700",
        label === "Cut" && "bg-red-500/20 text-red-400 border-red-500/20"
      )}
    >
      {label}
    </span>
  );
}
