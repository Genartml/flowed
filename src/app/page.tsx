import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {

  Sparkles,
  Wallet,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Target,
  Brain,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { LandingProfileDropdown } from "@/components/landing-profile-dropdown";

export const metadata: Metadata = {
  title: "Flowwled — AI-Powered Financial Cockpit for Solo Founders & Freelancers",
  description:
    "Track your startup runway in real-time. AI analyzes every expense with Buy/Don't Buy verdicts. Simulate what-if scenarios before big decisions. Free for solo founders.",
  openGraph: {
    title: "Flowwled — AI-Powered Financial Cockpit for Founders",
    description:
      "Stop guessing. Track runway, analyze expenses with AI, and simulate any scenario — built for solo founders and freelancers.",
    url: "https://flowwled.com",
    type: "website",
  },
  alternates: {
    canonical: "https://flowwled.com",
  },
};

// JSON-LD Structured Data
function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Flowwled",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://flowwled.com",
        description:
          "AI-powered financial cockpit for solo founders and freelancers. Track runway, analyze expenses, and simulate what-if scenarios.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          description: "Free forever for solo founders",
        },
        featureList: [
          "AI Expense Verdicts",
          "Real-time Runway Tracking",
          "What-If Financial Simulator",
          "Smart Ledger",
          "Burn Rate Breakdown",
          "Monthly AI Summaries",
        ],
        screenshot: "https://flowwled.com/brand/og-image.png",
      },
      {
        "@type": "Organization",
        name: "Flowwled",
        url: "https://flowwled.com",
        logo: "https://flowwled.com/brand/logo-icon.png",
        sameAs: [],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Flowwled?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Flowwled is an AI-powered financial cockpit built for solo founders and freelancers. It tracks your runway, analyzes every expense with AI verdicts (Buy/Don't Buy), and lets you simulate what-if scenarios before making big financial decisions.",
            },
          },
          {
            "@type": "Question",
            name: "Is Flowwled free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Flowwled is free forever for solo founders. No credit card required.",
            },
          },
          {
            "@type": "Question",
            name: "How does the AI CFO work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "During onboarding, you define your company mission and goals. The AI CFO uses this context to analyze every expense against your business trajectory, giving you Invest/Maintain/Cut labels and Buy/Don't Buy verdicts.",
            },
          },
          {
            "@type": "Question",
            name: "What is the What-If Simulator?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The What-If Simulator lets you model any financial scenario in plain English. Ask 'What if I hire a VA for ₹25,000/month?' and AI calculates the exact runway impact, new burn rate, and what you need to do to break even.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      <JsonLd />
      {/* Nav */}
      <header>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl" aria-label="Main navigation">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <Image 
              src="/brand/logo-full.png" 
              alt="Flowwled Logo" 
              width={200}
              height={56}
              className="h-28 w-auto object-contain scale-125 origin-left" 
              priority
            />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">How It Works</a>
            <a href="#ai-cfo" className="hover:text-zinc-100 transition-colors">AI CFO</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <LandingProfileDropdown email={user.email || ""} />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      </header>

      <main>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl text-center space-y-8">
          <div className="flex justify-center mb-8">
            <Image 
              src="/brand/logo-icon.png" 
              alt="Flowwled Logo" 
              width={160}
              height={160}
              className="h-40 w-40 object-contain animate-pulse-slow" 
              priority
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Flowwled AI
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
            Your AI-Powered{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Financial Cockpit
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed">
            Stop guessing. Let AI analyze every expense, track your runway in real-time,
            and tell you exactly when to spend and when to save. Built for founders who
            want total financial clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-bold text-zinc-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 w-full sm:w-auto justify-center"
            >
              Start Free <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 px-8 py-4 text-lg font-medium text-zinc-300 hover:bg-zinc-900 transition-all w-full sm:w-auto justify-center"
            >
              See Features
            </a>
          </div>
          <p className="text-sm text-zinc-600">No credit card required · Free forever for solo founders</p>
        </div>
      </section>

      {/* Dashboard Preview Mock */}
      <section className="relative px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "TOTAL FUNDS", value: "₹4,20,000", color: "text-zinc-100" },
                { label: "MONTHLY BURN", value: "₹45,000", color: "text-zinc-100" },
                { label: "RUNWAY", value: "9.3 months", color: "text-emerald-400" },
                { label: "MONTHLY INCOME", value: "₹62,000", color: "text-zinc-100" },
                { label: "REVENUE GAP", value: "₹0", color: "text-emerald-400" },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500">{m.label}</p>
                  <p className={`text-lg sm:text-2xl font-black mt-1 ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "📥", title: "Add Money In", sub: "Log incoming revenue" },
                { icon: "💸", title: "Log Expense", sub: "Direct manual entry" },
                { icon: "🤖", title: "AI Analyze", sub: "Get a CFO verdict" },
                { icon: "⚙️", title: "Settings", sub: "Configure Runway" },
              ].map((a) => (
                <div key={a.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-center">
                  <p className="text-2xl mb-2">{a.icon}</p>
                  <p className="text-sm font-bold text-zinc-200">{a.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{a.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 sm:py-28 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Features</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Everything a founder needs
            </h2>
            <p className="mx-auto max-w-xl text-zinc-400 text-lg">
              Replace messy spreadsheets with an intelligent cockpit that understands your business.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="h-6 w-6" />,
                color: "bg-purple-500/15 text-purple-400 border-purple-500/20",
                title: "AI Expense Verdicts",
                desc: "Every expense gets a Buy / Don't Buy / Conditional verdict from your personal AI CFO trained on your business goals.",
              },
              {
                icon: <Target className="h-6 w-6" />,
                color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
                title: "Live Runway Tracking",
                desc: "See exactly how many months your business can survive. Updated in real-time as money moves in and out.",
              },
              {
                icon: <Wallet className="h-6 w-6" />,
                color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
                title: "Smart Ledger",
                desc: "Every rupee tracked. Money In, Money Out — a chronological record of your entire financial history.",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
                title: "Burn Breakdown",
                desc: "See your spending split into Invest, Maintain, and Cut categories. Know where every rupee goes.",
              },
              {
                icon: <Zap className="h-6 w-6" />,
                color: "bg-orange-500/15 text-orange-400 border-orange-500/20",
                title: "Instant Updates",
                desc: "Zero-latency optimistic UI. Add an expense and see your runway update in under 50ms.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                color: "bg-rose-500/15 text-rose-400 border-rose-500/20",
                title: "Secure & Private",
                desc: "Your data lives in your own isolated Supabase environment. No one else can see your finances.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 border-t border-zinc-800/50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Three steps to total clarity
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Set Your Baseline",
                desc: "Tell us your current bank balance, monthly overhead, and business goals. Takes 2 minutes.",
              },
              {
                step: "02",
                title: "Log Every Rupee",
                desc: "Add money in when you earn, log expenses when you spend. Your cockpit updates instantly.",
              },
              {
                step: "03",
                title: "Let AI Decide",
                desc: "Before any purchase, ask your AI CFO. It analyzes impact on runway and gives a clear verdict.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-2xl font-black text-emerald-400">{s.step}</span>
                </div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI CFO Section */}
      <section id="ai-cfo" className="py-20 sm:py-28 px-4 border-t border-zinc-800/50">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">AI CFO</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Your business goals,{" "}
                <span className="text-emerald-400">baked into every decision</span>
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                During onboarding, you define your company mission and financial goals.
                The AI CFO uses this exact context to judge every single expense against
                your unique business trajectory.
              </p>
              <ul className="space-y-3">
                {[
                  "Custom AI prompt trained on YOUR business",
                  "Invest / Maintain / Cut labels on every expense",
                  "Runway impact analysis before you spend",
                  "Monthly summaries powered by Flowwled AI",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold">
                <Sparkles className="h-4 w-4" />
                FLOWLED AI VERDICT
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Adobe Creative Suite</span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-bold">BUY</span>
                </div>
                <p className="text-sm text-zinc-400">
                  &ldquo;This tool directly enables your design agency&apos;s core revenue stream.
                  At ₹4,999/mo it pays for itself with a single client project.
                  Runway impact: -0.1 months. Approved.&rdquo;
                </p>
                <div className="flex gap-2">
                  <span className="text-xs rounded-full bg-purple-500/20 text-purple-400 px-2.5 py-0.5 font-bold">Invest</span>
                  <span className="text-xs rounded-full bg-zinc-800 text-zinc-400 px-2.5 py-0.5">Score: 92/100</span>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Standing Desk ₹28,000</span>
                  <span className="rounded-full bg-red-500/20 text-red-400 px-3 py-1 text-xs font-bold">DON&apos;T BUY</span>
                </div>
                <p className="text-sm text-zinc-400">
                  &ldquo;Your runway is at 3.2 months — below the safe threshold.
                  This is a comfort expense, not revenue-critical.
                  Defer until runway exceeds 6 months.&rdquo;
                </p>
                <div className="flex gap-2">
                  <span className="text-xs rounded-full bg-red-500/20 text-red-400 px-2.5 py-0.5 font-bold">Cut</span>
                  <span className="text-xs rounded-full bg-zinc-800 text-zinc-400 px-2.5 py-0.5">Score: 24/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What-If Simulator Section */}
      <section className="py-20 sm:py-28 px-4 border-t border-zinc-800/50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />
        
        <div className="mx-auto max-w-5xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-bold text-blue-400">
                <Zap className="h-3.5 w-3.5" />
                NEW: What-If Simulator
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Afraid to make{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">big moves?</span>
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Every founder hesitates before a big hire, a new tool, or an office move.
                The What-If Simulator lets you <strong className="text-zinc-200">model any scenario</strong> before committing a single rupee.
              </p>
              <ul className="space-y-3">
                {[
                  "Ask in plain English — \"What if I hire a VA for ₹25,000/mo?\"",
                  "See exact runway impact — from 14 months to 9 months",
                  "Get a break-even plan — \"You need 2 more clients\"",
                  "Compare alternatives — AI suggests cheaper options",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-zinc-300 text-sm sm:text-base">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                Try the Simulator <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: Interactive Demo Mockup */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 space-y-4">
              {/* Mock Header */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-100">What-If Simulator</p>
                  <p className="text-[10px] text-zinc-500 font-medium">Model any scenario</p>
                </div>
              </div>

              {/* Mock Input */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-sm text-zinc-300 italic">&ldquo;What if I hire a virtual assistant for ₹25,000/month?&rdquo;</p>
              </div>

              {/* Mock Result - Verdict */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-400">Proceed with Caution</p>
                  <p className="text-[11px] text-zinc-400">Hiring a Virtual Assistant</p>
                </div>
              </div>

              {/* Mock Numbers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">New Runway</p>
                  <p className="text-xl font-black text-zinc-100">9.2 <span className="text-xs text-zinc-500 font-bold">months</span></p>
                  <p className="text-xs text-red-400 font-bold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> -4.8 months
                  </p>
                </div>
                <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">New Burn</p>
                  <p className="text-xl font-black text-zinc-100">₹70,000</p>
                  <p className="text-xs text-red-400 font-bold">+₹25,000/mo</p>
                </div>
              </div>

              {/* Mock Break Even */}
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">To Break Even</p>
                <p className="text-xs text-zinc-300">Acquire 2 more clients at ₹15,000/mo each to maintain your current runway.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4 border-t border-zinc-800/50">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to take control?
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
            Join founders who replaced gut-feeling decisions with AI-powered financial clarity.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-zinc-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 px-4" role="contentinfo">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Image 
              src="/brand/logo-full.png" 
              alt="Flowwled Logo" 
              width={100}
              height={32}
              className="h-24 w-auto object-contain" 
            />
          </div>
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Flowwled. Built for founders, by founders.
          </p>
        </div>
      </footer>
    </div>
  );
}
