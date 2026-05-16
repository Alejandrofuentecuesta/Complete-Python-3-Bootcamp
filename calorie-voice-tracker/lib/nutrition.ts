import { round } from "@/lib/utils";
import type { Exercise, FoodItem } from "@/lib/types";

export type FoodCatalogEntry = {
  keywords: string[];
  serving: string;
  grams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

const catalog: FoodCatalogEntry[] = [
  { keywords: ["coffee", "milk"], serving: "1 coffee with splash of milk", grams: 250, calories: 35, proteinGrams: 2, carbsGrams: 4, fatGrams: 1.5 },
  { keywords: ["toast"], serving: "1 slice toast", grams: 35, calories: 90, proteinGrams: 3, carbsGrams: 16, fatGrams: 1 },
  { keywords: ["avocado"], serving: "1/2 medium avocado", grams: 75, calories: 120, proteinGrams: 1.5, carbsGrams: 6, fatGrams: 11 },
  { keywords: ["chicken curry"], serving: "1 bowl chicken curry", grams: 300, calories: 430, proteinGrams: 32, carbsGrams: 18, fatGrams: 24 },
  { keywords: ["rice"], serving: "1 cup cooked rice", grams: 158, calories: 205, proteinGrams: 4.3, carbsGrams: 44.5, fatGrams: 0.4 },
  { keywords: ["banana"], serving: "1 medium banana", grams: 118, calories: 105, proteinGrams: 1.3, carbsGrams: 27, fatGrams: 0.4 },
  { keywords: ["egg"], serving: "1 large egg", grams: 50, calories: 72, proteinGrams: 6.3, carbsGrams: 0.4, fatGrams: 4.8 },
  { keywords: ["oatmeal", "porridge"], serving: "1 cup cooked oatmeal", grams: 234, calories: 166, proteinGrams: 6, carbsGrams: 28, fatGrams: 3.6 },
  { keywords: ["salad"], serving: "1 entree salad", grams: 300, calories: 350, proteinGrams: 18, carbsGrams: 24, fatGrams: 20 },
  { keywords: ["protein shake"], serving: "1 shake", grams: 350, calories: 220, proteinGrams: 28, carbsGrams: 12, fatGrams: 5 }
];

const fallbackPer100g = { calories: 180, proteinGrams: 8, carbsGrams: 20, fatGrams: 7 };

export function estimateFood(name: string, quantityHint?: string): FoodItem {
  const normalized = `${name} ${quantityHint ?? ""}`.toLowerCase();
  const match = catalog.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)));
  const multiplier = quantityMultiplier(normalized);
  const base = match ?? {
    keywords: [name],
    serving: quantityHint || "standard serving",
    grams: 250,
    ...scalePer100g(fallbackPer100g, 250)
  };

  return {
    name,
    portionDescription: quantityHint || base.serving,
    grams: round(base.grams * multiplier),
    calories: round(base.calories * multiplier),
    proteinGrams: round(base.proteinGrams * multiplier, 1),
    carbsGrams: round(base.carbsGrams * multiplier, 1),
    fatGrams: round(base.fatGrams * multiplier, 1),
    confidence: match ? 0.72 : 0.38,
    assumptions: [match ? `Matched MVP catalog item: ${base.serving}.` : "Used generic mixed-food fallback estimate."]
  };
}

export function estimateExercise(activity: string, durationMinutes: number, intensity: Exercise["intensity"] = "unknown"): Exercise {
  const lower = activity.toLowerCase();
  const met = lower.includes("walk") ? 3.5 : lower.includes("run") ? 8.3 : lower.includes("gym") || lower.includes("weights") ? 5 : lower.includes("cycle") ? 7 : 4.5;
  const intensityMultiplier = intensity === "vigorous" ? 1.2 : intensity === "light" ? 0.75 : 1;
  const assumedKg = 75;
  const caloriesBurned = round((met * 3.5 * assumedKg * durationMinutes * intensityMultiplier) / 200);
  return {
    activity,
    durationMinutes,
    intensity,
    caloriesBurned,
    confidence: 0.62,
    assumptions: [`Assumed 75kg body weight and ${met} MET activity estimate.`]
  };
}

function quantityMultiplier(text: string) {
  if (/\b(two|2)\b/.test(text)) return 2;
  if (/\b(three|3)\b/.test(text)) return 3;
  if (/\b(half|1\/2)\b/.test(text)) return 0.5;
  return 1;
}

function scalePer100g(base: typeof fallbackPer100g, grams: number) {
  const factor = grams / 100;
  return {
    calories: base.calories * factor,
    proteinGrams: base.proteinGrams * factor,
    carbsGrams: base.carbsGrams * factor,
    fatGrams: base.fatGrams * factor
  };
}
