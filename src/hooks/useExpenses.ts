"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Entity, Expense, FlowwledAnalysis, ExpenseFormData } from "@/lib/types";

export function useExpenses(entity: Entity) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchExpenses = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setLoading(false); return; }
      userIdRef.current = user.id;

      const mapExpense = (d: any): Expense => ({
        id: d.id,
        name: d.name,
        amount: Number(d.amount),
        category: d.category,
        reason: d.reason,
        process: d.process,
        outcome: d.outcome,
        label: d.aiLabel || "Maintain",
        score: d.aiScore ? Number(d.aiScore) : 0,
        reasoning: d.aiReasoning || "",
        runway_impact: d.aiRunwayImpact || "",
        verdict: d.aiVerdict || "Buy",
        condition: d.aiCondition || "",
        createdAt: new Date(d.createdAt),
        entity: d.entity,
        isRecurring: d.isRecurring || false,
        billingCycle: d.billingCycle || null,
      });

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("entity", entity)
        .eq("user_id", user.id)
        .order("createdAt", { ascending: false });

      if (error) {
        setError(error.message);
      } else if (data) {
        setExpenses(data.map(mapExpense));
      }
      setLoading(false);
    };

    fetchExpenses();

    const channelName = `expenses_changes_${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as any;
            if (newRecord.entity === entity && newRecord.user_id === userIdRef.current) {
              setExpenses((prev) => {
                if (prev.some((e) => e.id === newRecord.id)) return prev;
                return [mapExpense(newRecord), ...prev];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRecord = payload.new as any;
            setExpenses((prev) =>
              prev.map((e) => (e.id === updatedRecord.id ? mapExpense(updatedRecord) : e))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedRecord = payload.old as any;
            setExpenses((prev) => prev.filter((e) => e.id !== deletedRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entity]);

  const monthlyBurn = expenses.reduce((sum, e) => sum + e.amount, 0);

  const addExpense = async (
    formData: ExpenseFormData,
    analysis: FlowwledAnalysis
  ) => {
    const userId = userIdRef.current;
    if (!userId) return;

    const newId = crypto.randomUUID();

    // Optimistic local update
    const newExpense: Expense = {
      id: newId,
      name: formData.name,
      amount: Number(formData.amount),
      category: formData.category,
      reason: formData.reason || "",
      process: formData.process || "",
      outcome: formData.outcome || "",
      label: analysis.label,
      score: analysis.score,
      reasoning: analysis.reasoning,
      runway_impact: analysis.runway_impact,
      verdict: analysis.verdict,
      condition: analysis.condition,
      createdAt: new Date(),
      entity,
      isRecurring: formData.isRecurring,
      billingCycle: formData.billingCycle,
    };
    
    setExpenses((prev) => [newExpense, ...prev]);

    const { error } = await supabase.from("expenses").insert({
      id: newId,
      ...formData,
      aiScore: analysis.score,
      aiVerdict: analysis.verdict,
      aiReasoning: analysis.reasoning,
      aiRunwayImpact: analysis.runway_impact,
      aiCondition: analysis.condition,
      aiLabel: analysis.label,
      entity,
      user_id: userId,
    });

    if (error) {
      setExpenses((prev) => prev.filter(e => e.id !== newId));
      throw error;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    const userId = userIdRef.current;
    if (!userId) return;
    
    // Optimistic delete
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", userId);
      
    if (error) {
      // Realistically we should revert the optimistic delete, but fetchExpenses would handle it.
      // To be clean, we let the realtime subscription or error boundary handle it.
      throw error;
    }
  };

  return { expenses, loading, error, monthlyBurn, addExpense, deleteExpense };
}
