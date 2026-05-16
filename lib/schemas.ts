import { z } from "zod";

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const foodItemEstimateSchema = z.object({
  name: z.string().min(1),
  portionDescription: z.string().min(1),
  grams: z.number().positive().optional(),
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative(),
  carbsGrams: z.number().nonnegative(),
  fatGrams: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  assumptions: z.array(z.string()).default([])
});

export const mealEstimateSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "unknown"]),
  title: z.string().min(1),
  eatenAt: z.string().optional(),
  confidence: z.number().min(0).max(1),
  assumptions: z.array(z.string()).default([]),
  items: z.array(foodItemEstimateSchema)
});

export const exerciseEstimateSchema = z.object({
  activity: z.string().min(1),
  durationMinutes: z.number().positive(),
  intensity: z.enum(["light", "moderate", "vigorous", "unknown"]),
  caloriesBurned: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  assumptions: z.array(z.string()).default([])
});

export const extractionResultSchema = z.object({
  date: dateSchema,
  rawText: z.string().min(1),
  meals: z.array(mealEstimateSchema).default([]),
  exercises: z.array(exerciseEstimateSchema).default([]),
  corrections: z.array(z.object({
    targetHint: z.string(),
    operation: z.enum(["add", "remove", "replace", "move", "update"]),
    value: z.string(),
    confidence: z.number().min(0).max(1)
  })).default([]),
  questions: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1)
});

export const naturalLanguageLogRequestSchema = z.object({
  text: z.string().min(2),
  date: dateSchema.optional(),
  timezone: z.string().default("UTC"),
  source: z.enum(["web", "custom_gpt", "api", "voice_transcript"]).default("web")
});

export const createMealRequestSchema = z.object({
  date: dateSchema,
  mealType: mealEstimateSchema.shape.mealType.default("unknown"),
  title: z.string().min(1),
  items: z.array(foodItemEstimateSchema).min(1),
  rawText: z.string().optional()
});

export const createExerciseRequestSchema = z.object({
  date: dateSchema,
  activity: z.string().min(1),
  durationMinutes: z.number().positive(),
  intensity: exerciseEstimateSchema.shape.intensity.default("unknown"),
  caloriesBurned: z.number().nonnegative().optional(),
  rawText: z.string().optional()
});

export const patchEntryRequestSchema = z.object({
  entryType: z.enum(["meal", "food_item", "exercise"]),
  operation: z.enum(["update", "delete"]),
  patch: z.record(z.unknown()).default({}),
  reason: z.string().optional(),
  rawText: z.string().optional()
});
