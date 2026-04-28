"use client";

import { cn } from "@/lib/utils";

interface VerdictPillProps {
  verdict: "Buy" | "Don't Buy" | "Buy with conditions";
  condition?: string;
}

export function VerdictPill({ verdict, condition }: VerdictPillProps) {
  return (
    <div className="flex flex-col items-start">
      <span
        className={cn(
          "inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase",
          verdict === "Buy" && "bg-emerald-500/20 text-emerald-400",
          verdict === "Don't Buy" && "bg-red-500/20 text-red-400",
          verdict === "Buy with conditions" && "bg-amber-500/20 text-amber-400"
        )}
      >
        {verdict}
      </span>
      {verdict === "Buy with conditions" && condition && (
        <p className="text-xs text-amber-300/80 mt-1 max-w-[200px] leading-tight">{condition}</p>
      )}
    </div>
  );
}
