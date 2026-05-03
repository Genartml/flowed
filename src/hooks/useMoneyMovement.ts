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
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as any;
            if (newRecord.entity === entity && newRecord.user_id === userIdRef.current) {
              setMovements((prev) => {
                if (prev.some((m) => m.id === newRecord.id)) return prev;
                const newMovement = { ...newRecord, createdAt: new Date(newRecord.createdAt) };
                // Keep sorted: newest first
                return [newMovement, ...prev].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRecord = payload.new as any;
            setMovements((prev) =>
              prev.map((m) =>
                m.id === updatedRecord.id
                  ? { ...updatedRecord, createdAt: new Date(updatedRecord.createdAt) }
                  : m
              )
            );
          } else if (payload.eventType === "DELETE") {
            const deletedRecord = payload.old as any;
            setMovements((prev) => prev.filter((m) => m.id !== deletedRecord.id));
          }
        }
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

    const newId = crypto.randomUUID();

    // Optimistic local update
    const newMovement: MoneyMovement = {
      id: newId,
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
      id: newId,
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
      setMovements((prev) => prev.filter(m => m.id !== newId));
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

    const newId = crypto.randomUUID();

    // Optimistic local update
    const newMovement: MoneyMovement = {
      id: newId,
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
      id: newId,
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
      setMovements((prev) => prev.filter(m => m.id !== newId));
      throw error;
    }
  };

  const updateMovement = async (
    id: string,
    data: Partial<Pick<MoneyMovement, "source" | "amount" | "category" | "note">>
  ) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // Optimistic local update
    setMovements((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );

    const { error } = await supabase
      .from("ledger")
      .update(data)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      // Reverting optimistic update in error handling is tricky without previous state,
      // but fetchMovements or realtime updates will correct it eventually.
      throw error;
    }
  };

  return { movements, loading, addMoneyIn, addMoneyOut, updateMovement };
}
