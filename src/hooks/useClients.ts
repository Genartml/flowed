"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Entity, Client, IncomeSource } from "@/lib/types";

export function useClients(entity: Entity) {
  const [clients, setClients] = useState<Client[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);

    const fetchClients = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setLoading(false); return; }
      userIdRef.current = user.id;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("entity", entity)
        .eq("user_id", user.id)
        .order("createdAt", { ascending: false });

      if (data && !error) {
        if (entity === "primary") {
          setClients(
            data.map((d) => ({
              id: d.id,
              name: d.name,
              retainer: Number(d.retainer),
              status: d.status,
              createdAt: new Date(d.createdAt),
            })) as Client[]
          );
          setIncomeSources([]);
        } else {
          setIncomeSources(
            data.map((d) => ({
              id: d.id,
              name: d.name,
              amount: Number(d.retainer),
              type: d.status,
              createdAt: new Date(d.createdAt),
            })) as IncomeSource[]
          );
          setClients([]);
        }
      }
      setLoading(false);
    };

    fetchClients();

    const channelName = `clients_changes_${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clients",
        },
        () => fetchClients()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entity]);

  const totalRevenue =
    entity === "primary"
      ? clients.reduce((sum, c) => sum + c.retainer, 0)
      : incomeSources.reduce((sum, s) => sum + s.amount, 0);

  const addClient = async (name: string, retainer: number) => {
    const userId = userIdRef.current;
    if (!userId) return;

    const { error } = await supabase.from("clients").insert({
      name,
      retainer,
      status: "active",
      entity: "primary",
      user_id: userId,
    });
    if (error) throw error;
  };

  const deleteClient = async (clientId: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", clientId);
    if (error) throw error;
  };

  const addIncomeSource = async (
    name: string,
    amount: number,
    type: string
  ) => {
    const userId = userIdRef.current;
    if (!userId) return;

    const { error } = await supabase.from("clients").insert({
      name,
      retainer: amount,
      status: type,
      entity: "personal-brand",
      user_id: userId,
    });
    if (error) throw error;
  };

  const deleteIncomeSource = async (sourceId: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", sourceId);
    if (error) throw error;
  };

  return {
    clients,
    incomeSources,
    totalRevenue,
    loading,
    addClient,
    deleteClient,
    addIncomeSource,
    deleteIncomeSource,
  };
}
