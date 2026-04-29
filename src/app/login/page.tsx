"use client";

import Image from "next/image";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  LayoutDashboard, Shield, Zap, Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Trigger welcome email in the background
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch((err) => console.error("Failed to trigger welcome email:", err));

    // Check if user was actually created and confirmed
    // Supabase may require email verification
    if (data.user && data.session) {
      // User is confirmed and logged in — go to onboarding
      router.push("/onboarding");
      router.refresh();
    } else if (data.user && !data.session) {
      // Email confirmation is required
      setSuccess(
        "Account created! Check your email for a confirmation link, then come back and sign in."
      );
      setLoading(false);
    } else {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-100">
      {/* Left Panel - Brand / Intro */}
      <div className="hidden w-1/2 flex-col justify-between border-r border-zinc-800 bg-zinc-900 p-12 lg:flex relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="relative z-10 flex items-center mb-8">
          <Image 
            src="/brand/logo-full.png" 
            alt="Flowwled Logo" 
            width={160}
            height={40}
            className="h-28 w-auto object-contain" 
            priority
          />
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">
            Your personal AI CFO and financial cockpit.
          </h1>
          <p className="text-lg text-zinc-400">
            Take total control of your startup&apos;s runway, categorize expenses
            with AI, and track your cash position in real-time.
          </p>

          <div className="grid grid-cols-1 gap-6 pt-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  Secure by Design
                </h3>
                <p className="text-sm text-zinc-500">
                  Every user runs in their own isolated environment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  Instant AI Verdicts
                </h3>
                <p className="text-sm text-zinc-500">
                  Know exactly how an expense impacts your runway before you buy.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-blue-400">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">
                  Beautiful Dashboards
                </h3>
                <p className="text-sm text-zinc-500">
                  Stop fighting with ugly spreadsheets.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-zinc-500">
          © {new Date().getFullYear()} Flowwled Inc.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center lg:hidden">
            <Image 
              src="/brand/logo-full.png" 
              alt="Flowwled Logo" 
              width={160}
              height={40}
              className="h-16 w-auto object-contain" 
              priority
            />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Enter your email to sign in or create an account
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  className="h-11 border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="h-11 border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              <Button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                variant="outline"
                className="w-full h-11 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create new account"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-950 px-2 text-zinc-500">
                    Or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="w-full h-11 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 gap-2"
              >
                <GoogleIcon />
                Continue with Google
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-zinc-500 lg:text-left">
            By clicking continue, you agree to our Terms of Service and Privacy
            Policy.
          </p>

          <a href="/" className="block text-center lg:text-left text-sm font-medium text-zinc-500 hover:text-emerald-400 transition-colors mt-2">
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
