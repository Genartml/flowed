"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Entity } from "@/lib/types";

interface EntityContextType {
  entity: Entity;
  setEntity: (entity: Entity) => void;
}

const EntityContext = createContext<EntityContextType>({
  entity: "primary",
  setEntity: () => {},
});

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const [entity, setEntity] = useState<Entity>("primary");

  useEffect(() => {
    const stored = localStorage.getItem("flowled-entity") as Entity | null;
    if (stored === "primary" || stored === "personal-brand") {
      setEntity(stored);
    }
  }, []);

  const handleSetEntity = (e: Entity) => {
    setEntity(e);
    localStorage.setItem("flowled-entity", e);
  };

  return (
    <EntityContext.Provider value={{ entity, setEntity: handleSetEntity }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity() {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useEntity must be used within an EntityProvider");
  }
  return context;
}
