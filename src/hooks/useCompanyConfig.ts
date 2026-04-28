"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Entity, SharedConfig, EntityConfig } from "@/lib/types";

export function useCompanyConfig(entity: Entity) {
  const [sharedConfig, setSharedConfig] = useState<SharedConfig>({
    totalFunds: 0,
    updatedAt: new Date(),
  });
  const [entityConfig, setEntityConfig] = useState<EntityConfig>({
    monthlyIncome: 0,
  });
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);

    const fetchConfig = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setLoading(false); return; }
      userIdRef.current = user.id;

      // Fetch shared config for this user
      const { data: sharedData } = await supabase
        .from("config")
        .select("*")
        .eq("id", "shared")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sharedData) {
        setSharedConfig({
          totalFunds: Number(sharedData.totalFunds || 0),
          updatedAt: new Date(sharedData.updatedAt || new Date()),
          baselineOverhead: Number(sharedData.baselineOverhead || 0),
          monthlyIncome: Number(sharedData.monthlyIncome || 0),
          companyName: sharedData.companyName || "Flowwled",
          companyPrompt: sharedData.companyPrompt || "",
          hasPersonalBrand: !!sharedData.hasPersonalBrand,
          founderName: sharedData.founderName || "",
          founderRole: sharedData.founderRole || "",
          founderBio: sharedData.founderBio || "",
          founderAvatar: sharedData.founderAvatar || "",
          tourCompleted: !!sharedData.tourCompleted,
        });
      }

      // Fetch entity config for this user
      const { data: entityData } = await supabase
        .from("config")
        .select("*")
        .eq("id", entity)
        .eq("user_id", user.id)
        .maybeSingle();

      if (entityData) {
        setEntityConfig({
          monthlyIncome: Number(entityData.monthlyIncome || 0),
          teamSize: entityData.teamSize ? Number(entityData.teamSize) : undefined,
        });
      }
      setLoading(false);
    };

    fetchConfig();

    const channelName = `config_changes_${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "config" },
        () => fetchConfig()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entity]);

  const updateTotalFunds = useCallback(async (totalFunds: number) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // Optimistic local update
    setSharedConfig((prev) => ({ ...prev, totalFunds }));

    const { error } = await supabase
      .from("config")
      .update({ totalFunds, updatedAt: new Date().toISOString() })
      .eq("id", "shared")
      .eq("user_id", userId);
    if (error) console.error("Error updating total funds:", error);
  }, []);

  const updateMonthlyIncome = useCallback(
    async (monthlyIncome: number) => {
      const userId = userIdRef.current;
      if (!userId) return;

      // Optimistic local update
      setEntityConfig((prev) => ({ ...prev, monthlyIncome }));

      const { error } = await supabase
        .from("config")
        .update({ monthlyIncome, updatedAt: new Date().toISOString() })
        .eq("id", entity)
        .eq("user_id", userId);
      if (error) console.error("Error updating monthly income:", error);
    },
    [entity]
  );

  const updateTeamSize = useCallback(
    async (teamSize: number) => {
      const userId = userIdRef.current;
      if (!userId) return;

      // Optimistic local update
      setEntityConfig((prev) => ({ ...prev, teamSize }));

      const { error } = await supabase
        .from("config")
        .update({ teamSize, updatedAt: new Date().toISOString() })
        .eq("id", entity)
        .eq("user_id", userId);
      if (error) console.error("Error updating team size:", error);
    },
    [entity]
  );

  const updateCompanySettings = useCallback(
    async (settings: { companyName: string; companyPrompt: string; baselineOverhead: number }) => {
      const userId = userIdRef.current;
      if (!userId) return;

      // Optimistic local update
      setSharedConfig((prev) => ({ ...prev, ...settings }));

      const { error } = await supabase
        .from("config")
        .update({
          ...settings,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", "shared")
        .eq("user_id", userId);
      if (error) console.error("Error updating company settings:", error);
    },
    []
  );

  const updateFounderProfile = useCallback(
    async (profile: { founderName: string; founderRole: string; founderBio: string; founderAvatar: string }) => {
      const userId = userIdRef.current;
      if (!userId) return;

      // Optimistic local update
      setSharedConfig((prev) => ({ ...prev, ...profile }));

      const { error } = await supabase
        .from("config")
        .update({
          ...profile,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", "shared")
        .eq("user_id", userId);
      if (error) console.error("Error updating founder profile:", error);
    },
    []
  );

  const completeTour = useCallback(
    async () => {
      const userId = userIdRef.current;
      if (!userId) return;

      setSharedConfig((prev) => ({ ...prev, tourCompleted: true }));

      const { error } = await supabase
        .from("config")
        .update({
          tourCompleted: true,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", "shared")
        .eq("user_id", userId);
      if (error) console.error("Error completing tour:", error);
    },
    []
  );

  return {
    sharedConfig,
    entityConfig,
    loading,
    updateTotalFunds,
    updateMonthlyIncome,
    updateTeamSize,
    updateCompanySettings,
    updateFounderProfile,
    completeTour,
  };
}
