import OpenAI from "openai";
import { extractionResultSchema, type naturalLanguageLogRequestSchema } from "@/lib/schemas";
import { estimateExercise, estimateFood } from "@/lib/nutrition";
import { todayIso } from "@/lib/utils";
import type { z } from "zod";

const extractionJsonSchema = {
  name: "daily_log_extraction",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["date", "rawText", "meals", "exercises", "corrections", "questions", "assumptions", "confidence"],
    properties: {
      date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      rawText: { type: "string" },
      meals: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["mealType", "title", "confidence", "assumptions", "items"],
          properties: {
            mealType: { enum: ["breakfast", "lunch", "dinner", "snack", "unknown"] },
            title: { type: "string" },
            eatenAt: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            assumptions: { type: "array", items: { type: "string" } },
            items: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "portionDescription", "calories", "proteinGrams", "carbsGrams", "fatGrams", "confidence", "assumptions"],
                properties: {
                  name: { type: "string" },
                  portionDescription: { type: "string" },
                  grams: { type: "number" },
                  calories: { type: "number" },
                  proteinGrams: { type: "number" },
                  carbsGrams: { type: "number" },
                  fatGrams: { type: "number" },
                  confidence: { type: "number", minimum: 0, maximum: 1 },
                  assumptions: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      },
      exercises: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["activity", "durationMinutes", "intensity", "caloriesBurned", "confidence", "assumptions"],
          properties: {
            activity: { type: "string" },
            durationMinutes: { type: "number" },
            intensity: { enum: ["light", "moderate", "vigorous", "unknown"] },
            caloriesBurned: { type: "number" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            assumptions: { type: "array", items: { type: "string" } }
          }
        }
      },
      corrections: { type: "array", items: { type: "object", additionalProperties: false, required: ["targetHint", "operation", "value", "confidence"], properties: { targetHint: { type: "string" }, operation: { enum: ["add", "remove", "replace", "move", "update"] }, value: { type: "string" }, confidence: { type: "number", minimum: 0, maximum: 1 } } } },
      questions: { type: "array", items: { type: "string" } },
      assumptions: { type: "array", items: { type: "string" } },
      confidence: { type: "number", minimum: 0, maximum: 1 }
    }
  },
  strict: true
} as const;

export async function extractNaturalLanguageLog(input: z.infer<typeof naturalLanguageLogRequestSchema>) {
  if (process.env.OPENAI_API_KEY) {
    return extractWithOpenAI(input);
  }
  return heuristicExtract(input);
}

export { extractionJsonSchema };

async function extractWithOpenAI(input: z.infer<typeof naturalLanguageLogRequestSchema>) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_EXTRACTION_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: "Extract food, exercise, and corrections from a short daily health log. Do not invent false precision. Use ordinary portion estimates when vague, include assumptions, confidence, and only ask clarification questions when the answer materially changes the day summary. Preserve the raw user text."
      },
      {
        role: "user",
        content: `Date default: ${input.date ?? todayIso()}\nTimezone: ${input.timezone}\nText: ${input.text}`
      }
    ],
    text: {
      format: {
        type: "json_schema",
        ...extractionJsonSchema
      }
    }
  });
  const parsed = JSON.parse(response.output_text);
  return extractionResultSchema.parse(parsed);
}

function heuristicExtract(input: z.infer<typeof naturalLanguageLogRequestSchema>) {
  const text = input.text;
  const lower = text.toLowerCase();
  const foodHints = ["coffee with milk", "toast", "avocado", "chicken curry", "rice", "banana", "egg", "oatmeal", "salad", "protein shake"];
  const items = foodHints.filter((food) => lower.includes(food)).map((food) => estimateFood(food, food));
  const durationMatch = lower.match(/(\d+)\s*(minute|min|minutes|mins|hour|hours)/);
  const duration = durationMatch ? Number(durationMatch[1]) * (durationMatch[2].startsWith("hour") ? 60 : 1) : undefined;
  const activity = lower.includes("gym") ? "gym" : lower.includes("walk") ? "walking" : lower.includes("run") ? "running" : lower.includes("cycle") ? "cycling" : undefined;

  return extractionResultSchema.parse({
    date: input.date ?? todayIso(),
    rawText: text,
    meals: items.length ? [{ mealType: inferMealType(lower), title: "Narrated meal", confidence: 0.56, assumptions: ["Heuristic parser grouped detected foods into one meal."], items }] : [],
    exercises: activity && duration ? [estimateExercise(activity, duration, lower.includes("hard") ? "vigorous" : "unknown")] : [],
    corrections: detectCorrection(lower),
    questions: items.length || activity ? [] : ["What food or exercise would you like to log?"],
    assumptions: ["OPENAI_API_KEY is not configured, so MVP keyword extraction was used."],
    confidence: 0.5
  });
}

function inferMealType(text: string) {
  if (text.includes("breakfast")) return "breakfast" as const;
  if (text.includes("lunch")) return "lunch" as const;
  if (text.includes("dinner")) return "dinner" as const;
  if (text.includes("snack")) return "snack" as const;
  return "unknown" as const;
}

function detectCorrection(text: string) {
  if (!/\b(change|remove|add|that was)\b/.test(text)) return [];
  return [{ targetHint: text, operation: text.includes("remove") ? "remove" : text.includes("add") ? "add" : "update", value: text, confidence: 0.45 }];
}
