"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function saveOnboardingConfig(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const totalFunds = Number(formData.get("totalFunds")) || 0;
  const monthlyIncome = Number(formData.get("monthlyIncome")) || 0;
  const baselineOverhead = Number(formData.get("baselineOverhead")) || 0;
  const companyName = formData.get("companyName") as string || "Flowwled";

  const companyPrompt = formData.get("companyPrompt") as string || "";

  // Insert or update shared config for this user
  const { error } = await supabase.from("config").upsert({
    id: "shared",
    totalFunds,
    monthlyIncome,
    baselineOverhead,
    companyName,
    companyPrompt,
    updatedAt: new Date().toISOString(),
    user_id: user.id
  }, { onConflict: "id, user_id" });

  if (error) {
    console.error("Failed to save config:", error);
    redirect("/onboarding?error=Could not save config");
  }

  redirect("/dashboard");
}
