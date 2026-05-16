import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function round(value: number, digits = 0) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function startOfWeekIso(date = todayIso()) {
  const current = new Date(`${date}T00:00:00.000Z`);
  const day = current.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setUTCDate(current.getUTCDate() + diff);
  return current.toISOString().slice(0, 10);
}

export function confidenceLabel(score: number) {
  if (score >= 0.8) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}
