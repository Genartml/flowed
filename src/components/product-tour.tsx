"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Rocket,
  BarChart3,
  Sparkles,
  Zap,
  Settings2,
  Navigation,
  CheckCircle2,
  ArrowRight,
  X,
} from "lucide-react";

interface TourStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  targetId?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    icon: <Rocket className="w-8 h-8" />,
    title: "Welcome to Flowwled! 🎉",
    description:
      "Your AI-powered financial cockpit is ready. Let us give you a quick 30-second tour of the key features.",
  },
  {
    id: "cockpit",
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Your Financial Cockpit",
    description:
      "This top bar shows your total funds, monthly burn rate, net cash flow, and runway in real-time. Click any value to edit it directly.",
    targetId: "tour-cockpit",
    position: "bottom",
  },
  {
    id: "ai-analyze",
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI Expense Analyzer",
    description:
      "Before spending money, ask AI. It gives you a Buy/Don't Buy verdict based on your company's runway and goals. Like having a CFO on call 24/7.",
    targetId: "tour-ai-analyze",
    position: "bottom",
  },
  {
    id: "whatif",
    icon: <Zap className="w-6 h-6" />,
    title: "What-If Simulator",
    description:
      "Afraid to hire or buy something? Ask 'What if I hire a VA for ₹25k/mo?' — AI calculates the exact runway impact and tells you what you need to break even.",
    targetId: "tour-whatif",
    position: "bottom",
  },
  {
    id: "settings",
    icon: <Settings2 className="w-6 h-6" />,
    title: "Settings & Config",
    description:
      "Set your total funds, monthly income, baseline expenses, and company mission. This context powers all AI features.",
    targetId: "tour-settings",
    position: "bottom",
  },
  {
    id: "navigation",
    icon: <Navigation className="w-6 h-6" />,
    title: "Explore More",
    description:
      "Use the sidebar to access Expenses (full history), Ledger (revenue tracking), and Clients (invoice management). Everything syncs in real-time.",
    targetId: "tour-sidebar-nav",
    position: "right",
  },
  {
    id: "done",
    icon: <CheckCircle2 className="w-8 h-8" />,
    title: "You're All Set!",
    description:
      "Start by adding your first expense or asking AI a question. Your financial cockpit is ready for takeoff. 🚀",
  },
];

interface ProductTourProps {
  onComplete: () => void;
}

export function ProductTour({ onComplete }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const isFirstOrLast = currentStep === 0 || currentStep === TOUR_STEPS.length - 1;
  const totalSteps = TOUR_STEPS.length;

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Find and highlight target element
  useEffect(() => {
    if (!step.targetId) {
      setTargetRect(null);
      return;
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Wait for scroll to finish
      const timer = setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, step.targetId]);

  // Update rect on resize
  useEffect(() => {
    const handleResize = () => {
      if (step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el) setTargetRect(el.getBoundingClientRect());
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [step.targetId]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  }, [currentStep, totalSteps, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  // Spotlight clip-path
  const spotlightStyle = targetRect
    ? {
        clipPath: `polygon(
          0% 0%, 0% 100%, 
          ${targetRect.left - 8}px 100%, 
          ${targetRect.left - 8}px ${targetRect.top - 8}px, 
          ${targetRect.right + 8}px ${targetRect.top - 8}px, 
          ${targetRect.right + 8}px ${targetRect.bottom + 8}px, 
          ${targetRect.left - 8}px ${targetRect.bottom + 8}px, 
          ${targetRect.left - 8}px 100%, 
          100% 100%, 100% 0%
        )`,
      }
    : {};

  // Tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || isFirstOrLast) {
      // Center card
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const pad = 16;
    const pos = step.position || "bottom";

    switch (pos) {
      case "bottom":
        return {
          position: "fixed",
          top: `${targetRect.bottom + pad}px`,
          left: `${Math.max(16, Math.min(targetRect.left, window.innerWidth - 400))}px`,
        };
      case "top":
        return {
          position: "fixed",
          bottom: `${window.innerHeight - targetRect.top + pad}px`,
          left: `${Math.max(16, Math.min(targetRect.left, window.innerWidth - 400))}px`,
        };
      case "right":
        return {
          position: "fixed",
          top: `${Math.max(16, targetRect.top)}px`,
          left: `${Math.min(targetRect.right + pad, window.innerWidth - 400)}px`,
        };
      case "left":
        return {
          position: "fixed",
          top: `${Math.max(16, targetRect.top)}px`,
          right: `${window.innerWidth - targetRect.left + pad}px`,
        };
      default:
        return {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  // Highlight ring around target
  const highlightStyle = targetRect
    ? {
        position: "fixed" as const,
        top: `${targetRect.top - 8}px`,
        left: `${targetRect.left - 8}px`,
        width: `${targetRect.width + 16}px`,
        height: `${targetRect.height + 16}px`,
        border: "2px solid rgba(16, 185, 129, 0.6)",
        borderRadius: "16px",
        boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.15), 0 0 30px -5px rgba(16, 185, 129, 0.3)",
        pointerEvents: "none" as const,
        zIndex: 9998,
        transition: "all 0.3s ease",
      }
    : null;

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Dark overlay with spotlight cutout */}
      <div
        className="absolute inset-0 bg-black/70 transition-all duration-300"
        style={spotlightStyle}
        onClick={handleSkip}
      />

      {/* Highlight ring */}
      {highlightStyle && <div style={highlightStyle} />}

      {/* Tooltip Card */}
      <div
        style={getTooltipStyle()}
        className="z-[9999] w-[380px] max-w-[calc(100vw-32px)]"
      >
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-5 pb-0 flex items-start justify-between">
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                isFirstOrLast
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {step.icon}
            </div>
            <button
              onClick={handleSkip}
              className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
              title="Skip tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Card body */}
          <div className="px-6 pt-3 pb-4">
            <h3 className="text-lg font-bold text-zinc-100 mb-1.5">{step.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
          </div>

          {/* Card footer */}
          <div className="px-6 pb-5 flex items-center justify-between">
            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep
                      ? "w-6 bg-emerald-400"
                      : i < currentStep
                      ? "w-1.5 bg-emerald-400/40"
                      : "w-1.5 bg-zinc-700"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && currentStep < totalSteps - 1 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  currentStep === totalSteps - 1
                    ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                    : currentStep === 0
                    ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                    : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                }`}
              >
                {currentStep === 0
                  ? "Start Tour"
                  : currentStep === totalSteps - 1
                  ? "Let's Go!"
                  : "Next"}
                {currentStep < totalSteps - 1 && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
