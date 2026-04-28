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

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("entity", entity)
        .eq("user_id", user.id)
        .order("createdAt", { ascending: false });

      if (error) {
        setError(error.message);
      } else if (data) {
        setExpenses(
          data.map((d) => ({
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
          })) as Expense[]
        );
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
        () => fetchExpenses()
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

    // Optimistic local update
    const newExpense: Expense = {
      id: `temp-${Date.now()}`,
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
    };
    
    setExpenses((prev) => [newExpense, ...prev]);

    const { error } = await supabase.from("expenses").insert({
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
      setExpenses((prev) => prev.filter(e => e.id !== newExpense.id));
      throw error;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    const userId = userIdRef.current;
    if (!userId) return;
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", userId);
    if (error) throw error;
  };

  return { expenses, loading, error, monthlyBurn, addExpense, deleteExpense };
}
