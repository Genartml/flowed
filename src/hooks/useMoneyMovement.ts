"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Entity, MoneyMovement } from "@/lib/types";

export function useMoneyMovement(entity: Entity) {
  const [movements, setMovements] = useState<MoneyMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);

    const fetchMovements = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setLoading(false); return; }
      userIdRef.current = user.id;

      const { data, error } = await supabase
        .from("ledger")
        .select("*")
        .eq("entity", entity)
        .eq("user_id", user.id)
        .order("createdAt", { ascending: false });

      if (!error && data) {
        setMovements(
          data.map((d) => ({
            ...d,
            createdAt: new Date(d.createdAt),
          })) as MoneyMovement[]
        );
      }
      setLoading(false);
    };

    fetchMovements();

    const channelName = `ledger_changes_${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ledger",
        },
        () => fetchMovements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entity]);

  const addMoneyIn = async (
    source: string,
    amount: number,
    category: string,
    isRecurringRevenue?: boolean,
    note?: string
  ) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // Optimistic local update
    const newMovement: MoneyMovement = {
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
      type: "in",
      source,
      amount,
      category,
      note: note || "",
      isRecurring: false,
      isRecurringRevenue: isRecurringRevenue || false,
      entity,
    };
    setMovements((prev) => [newMovement, ...prev]);

    const { error } = await supabase.from("ledger").insert({
      type: "in",
      source,
      amount,
      category,
      note: note || "",
      isRecurring: false,
      isRecurringRevenue: isRecurringRevenue || false,
      entity,
      user_id: userId,
    });

    if (error) {
      // Revert optimistic update on failure (optional but good practice)
      setMovements((prev) => prev.filter(m => m.id !== newMovement.id));
      throw error;
    }
  };

  const addMoneyOut = async (
    source: string,
    amount: number,
    category: string,
    note?: string,
    isRecurring?: boolean
  ) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // Optimistic local update
    const newMovement: MoneyMovement = {
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
      type: "out",
      source,
      amount,
      category,
      note: note || "",
      isRecurring: isRecurring || false,
      entity,
    };
    setMovements((prev) => [newMovement, ...prev]);

    const { error } = await supabase.from("ledger").insert({
      type: "out",
      source,
      amount,
      category,
      note: note || "",
      isRecurring: isRecurring || false,
      entity,
      user_id: userId,
    });

    if (error) {
      setMovements((prev) => prev.filter(m => m.id !== newMovement.id));
      throw error;
    }
  };

  return { movements, loading, addMoneyIn, addMoneyOut };
}
