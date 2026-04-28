"use client";

import { useEntity } from "@/contexts/entity-context";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import type { Entity } from "@/lib/types";

export function EntitySwitcher() {
  const { entity, setEntity } = useEntity();
  const { sharedConfig } = useCompanyConfig("primary");

  // Filter entities based on user configuration
  const availableEntities: { id: Entity; label: string }[] = [
    { id: "primary", label: sharedConfig.companyName || "Business" },
  ];

  if (sharedConfig.hasPersonalBrand) {
    availableEntities.push({ id: "personal-brand", label: "Personal Brand" });
  }

  // If only one entity is available, don't show the switcher (cleaner UI)
  if (availableEntities.length <= 1) {
    return null;
  }

  return (
    <div className="flex gap-1 bg-zinc-800 rounded-xl p-1">
      {availableEntities.map((e) => (
        <button
          key={e.id}
          onClick={() => setEntity(e.id)}
          className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all ${
            entity === e.id
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {e.label}
        </button>
      ))}
    </div>
  );
}
