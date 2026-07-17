import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getAIScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

export function getAIScoreBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500/20";
  if (score >= 60) return "bg-blue-500/20";
  if (score >= 40) return "bg-yellow-500/20";
  return "bg-red-500/20";
}

export const PIPELINE_STAGES = [
  { id: "new_lead", name: "New Lead", color: "#3B82F6", order: 1 },
  { id: "contact_attempted", name: "Contact Attempted", color: "#8B5CF6", order: 2 },
  { id: "contacted", name: "Contacted", color: "#EC4899", order: 3 },
  { id: "appointment_scheduled", name: "Appointment Scheduled", color: "#F59E0B", order: 4 },
  { id: "needs_analysis", name: "Needs Analysis", color: "#10B981", order: 5 },
  { id: "quoted", name: "Quoted", color: "#14B8A6", order: 6 },
  { id: "application_sent", name: "Application Sent", color: "#06B6D4", order: 7 },
  { id: "application_submitted", name: "Application Submitted", color: "#2563EB", order: 8 },
  { id: "underwriting", name: "Underwriting", color: "#7C3AED", order: 9 },
  { id: "issued", name: "Issued", color: "#D4AF37", order: 10 },
  { id: "active_policy", name: "Active Policy", color: "#10B981", order: 11 },
  { id: "referral_requested", name: "Referral Requested", color: "#F97316", order: 12 },
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number]["id"];

export const LEAD_SOURCES = [
  "Facebook Ads",
  "Google Ads",
  "Referral",
  "Website",
  "Lead Gen Partner",
  "Direct Mail",
  "Radio",
  "Door to Door",
  "Center of Influence",
  "Social Media",
  "Other",
] as const;

export const MARITAL_STATUS = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
] as const;

export const POLICY_STATUSES = [
  "Pending",
  "Active",
  "Lapsed",
  "Cancelled",
  "Expired",
  "In Force",
] as const;

export const COMMISSION_STATUSES = [
  "Pending",
  "Paid",
  "Chargeback",
  "Recalled",
] as const;
