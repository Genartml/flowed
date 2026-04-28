"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Rocket,
  ArrowRight,
  Building2,
  Wallet,
  Target,
  
  Loader2,
} from "lucide-react";

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [companyPrompt, setCompanyPrompt] = useState("");
  const [totalFunds, setTotalFunds] = useState("");
  const [baselineOverhead, setBaselineOverhead] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [hasPersonalBrand, setHasPersonalBrand] = useState(false);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error: upsertError } = await supabase.from("config").upsert(
      {
        id: "shared",
        totalFunds: Number(totalFunds) || 0,
        monthlyIncome: Number(monthlyIncome) || 0,
        baselineOverhead: Number(baselineOverhead) || 0,
        companyName: companyName || "Flowwled",
        companyPrompt: companyPrompt || "",
        hasPersonalBrand: hasPersonalBrand,
        updatedAt: new Date().toISOString(),
        user_id: user.id,
      },
      { onConflict: "id, user_id" }
    );

    if (upsertError) {
      console.error("Onboarding save error:", upsertError);
      setError(`Failed to save config: ${upsertError.message}`);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 text-zinc-100 p-4">
      {/* Abstract Background Element */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-2xl">
        {/* Step Indicator */}
        {step > 0 && (
          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-16 rounded-full transition-colors duration-500 ${
                  step >= i ? "bg-emerald-500" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        )}

        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                <img src="/brand/logo-icon.png" alt="Flowwled Logo" className="h-14 w-14 object-contain" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight">
                  Welcome to Flowwled
                </h1>
                <p className="text-lg text-zinc-400 max-w-md mx-auto">
                  Your intelligent financial cockpit is almost ready. Let&apos;s
                  configure your AI CFO to perfectly understand your business.
                </p>
              </div>
              <Button
                onClick={nextStep}
                className="mt-4 bg-zinc-100 text-zinc-950 hover:bg-white font-bold h-12 px-8 rounded-xl text-md"
              >
                Let&apos;s get started{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Workspace</h2>
                  <p className="text-zinc-400">
                    What do you call your empire?
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="companyName"
                  className="text-zinc-300 text-lg"
                >
                  Company or Brand Name
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="h-14 text-xl border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-emerald-500/50 rounded-xl"
                />
              </div>

              <div className="space-y-3 pt-4">
                <Label
                  htmlFor="companyPrompt"
                  className="text-zinc-300 text-lg flex items-center gap-2"
                >
                  Company Mission & Goal <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">AI CFO Context</span>
                </Label>
                <textarea
                  id="companyPrompt"
                  value={companyPrompt}
                  onChange={(e) => setCompanyPrompt(e.target.value)}
                  placeholder="e.g. We are a fast-growing design agency aiming to hit $10k MRR while staying lean. Approve tools that save time, reject luxury expenses."
                  className="w-full h-32 p-4 text-md border border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-xl resize-none transition-all"
                />
                <p className="text-sm text-zinc-500 pt-1">
                  Your AI CFO will use this exact prompt to analyze, approve, or reject your expenses.
                </p>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!companyName}
                  className="bg-zinc-100 text-zinc-950 hover:bg-white font-semibold px-8 h-12 rounded-xl"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Cash Position</h2>
                  <p className="text-zinc-400">
                    Let&apos;s establish your baseline.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="totalFunds"
                  className="text-zinc-300 text-lg"
                >
                  Current Bank Balance (₹)
                </Label>
                <Input
                  id="totalFunds"
                  type="number"
                  value={totalFunds}
                  onChange={(e) => setTotalFunds(e.target.value)}
                  placeholder="e.g. 50000"
                  className="h-14 text-xl font-mono border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-emerald-500/50 rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!totalFunds}
                  className="bg-zinc-100 text-zinc-950 hover:bg-white font-semibold px-8 h-12 rounded-xl"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/20">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Survival Baseline</h2>
                  <p className="text-zinc-400">
                    The bare minimum to keep the lights on.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="baselineOverhead"
                  className="text-zinc-300 text-lg"
                >
                  Minimum Monthly Overhead (₹)
                </Label>
                <Input
                  id="baselineOverhead"
                  type="number"
                  value={baselineOverhead}
                  onChange={(e) => setBaselineOverhead(e.target.value)}
                  placeholder="e.g. 5000"
                  className="h-14 text-xl font-mono border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-emerald-500/50 rounded-xl"
                />
                <p className="text-sm text-zinc-500 pt-2">
                  The AI CFO uses this to calculate a highly conservative,
                  worst-case-scenario cash runway.
                </p>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!baselineOverhead}
                  className="bg-zinc-100 text-zinc-950 hover:bg-white font-semibold px-8 h-12 rounded-xl"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/20">
                  <img src="/brand/logo-icon.png" alt="Flowwled" className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Growth Target</h2>
                  <p className="text-zinc-400">Where are we aiming?</p>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="monthlyIncome"
                  className="text-zinc-300 text-lg"
                >
                  Target Monthly Revenue (₹)
                </Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 15000"
                  className="h-14 text-xl font-mono border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-emerald-500/50 rounded-xl"
                />
                <p className="text-sm text-zinc-500 pt-2">
                  Your dashboard will track your &lsquo;Revenue Gap&rsquo;
                  against this target in real-time.
                </p>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!monthlyIncome}
                  className="bg-zinc-100 text-zinc-950 hover:bg-white font-semibold px-8 h-12 rounded-xl"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/20">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Additional Entities</h2>
                  <p className="text-zinc-400">Do you manage a separate personal brand?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => setHasPersonalBrand(true)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    hasPersonalBrand 
                      ? "border-pink-500/50 bg-pink-500/5" 
                      : "border-zinc-800 bg-zinc-950/30 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">Yes, I have a Personal Brand</h3>
                      <p className="text-sm text-zinc-400">Track content costs and creator income separately from business.</p>
                    </div>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${hasPersonalBrand ? "border-pink-500 bg-pink-500" : "border-zinc-700"}`}>
                      {hasPersonalBrand && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setHasPersonalBrand(false)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    !hasPersonalBrand 
                      ? "border-emerald-500/50 bg-emerald-500/5" 
                      : "border-zinc-800 bg-zinc-950/30 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">No, just Business for now</h3>
                      <p className="text-sm text-zinc-400">Keep it simple. You can always enable this later.</p>
                    </div>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${!hasPersonalBrand ? "border-emerald-500 bg-emerald-500" : "border-zinc-700"}`}>
                      {!hasPersonalBrand && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold px-8 h-12 rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Initializing..." : "Launch Dashboard"}
                  {!loading && <Rocket className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Back to website link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
