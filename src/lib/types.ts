export type Entity = "primary" | "personal-brand";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  reason: string;
  process: string;
  outcome: string;
  label: "Invest" | "Maintain" | "Cut";
  score: number;
  reasoning: string;
  runway_impact: string;
  verdict: "Buy" | "Don't Buy" | "Buy with conditions";
  condition: string;
  createdAt: Date;
  entity: Entity;
  isRecurring?: boolean;
  billingCycle?: "monthly" | "yearly" | null;
}

export interface Client {
  id: string;
  name: string;
  retainer: number;
  createdAt: Date;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  type: "sponsorship" | "consulting" | "affiliate" | "freelance" | "other";
  createdAt: Date;
}

export interface MoneyMovement {
  id: string;
  type: "in" | "out";
  source: string;
  amount: number;
  category: string;
  note: string;
  isRecurring: boolean;
  isRecurringRevenue?: boolean;
  createdAt: Date;
  entity: Entity;
}

export interface SharedConfig {
  totalFunds: number;
  updatedAt: Date;
  baselineOverhead?: number;
  monthlyIncome?: number;
  companyName?: string;
  companyPrompt?: string;
  hasPersonalBrand?: boolean;
  founderName?: string;
  founderRole?: string;
  founderBio?: string;
  founderAvatar?: string;
  tourCompleted?: boolean;
}

export interface EntityConfig {
  monthlyIncome: number;
  teamSize?: number;
  baselineOverhead?: number;
}

export interface FlowwledAnalysis {
  label: "Invest" | "Maintain" | "Cut";
  score: number;
  reasoning: string;
  runway_impact: string;
  verdict: "Buy" | "Don't Buy" | "Buy with conditions";
  condition: string;
}

export interface CockpitMetrics {
  totalFunds: number;
  monthlyBurn: number;
  runway: number;
  monthlyIncome: number;
  revenueGap: number;
}

export interface ExpenseFormData {
  name: string;
  amount: number;
  category: string;
  reason: string;
  process: string;
  outcome: string;
  isRecurring: boolean;
  billingCycle: "monthly" | "yearly" | null;
}

export const GENARTML_CATEGORIES = [
  "SaaS & Tools",
  "Infrastructure",
  "Team & Payroll",
  "Marketing",
  "Client Delivery",
  "Office & Ops",
  "Travel",
  "Other",
] as const;

export const PERSONAL_BRAND_CATEGORIES = [
  "Content Creation",
  "Equipment",
  "Software & Tools",
  "Courses & Learning",
  "Events & Networking",
  "Branding & Design",
  "Ads & Promotion",
  "Other",
] as const;

export const MONEY_IN_TYPES = [
  "Client Payment",
  "Advance",
  "Personal Funds",
  "Sponsorship",
  "Consulting",
  "Affiliate",
  "Other",
] as const;
