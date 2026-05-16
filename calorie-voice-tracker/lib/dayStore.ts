import { createSupabaseAdminClient } from "@/lib/supabaseServer";
import { estimateExercise } from "@/lib/nutrition";
import { addDays, round, startOfWeekIso, todayIso } from "@/lib/utils";
import type { DaySummary, Exercise, FoodItem, Meal, WeeklySummary } from "@/lib/types";

export async function saveExtractedLog(userId: string, extracted: { date: string; rawText: string; meals: Meal[]; exercises: Exercise[]; questions: string[]; assumptions: string[]; confidence: number }, source: string) {
  const supabase = createSupabaseAdminClient();
  const { data: dailyLog, error: logError } = await supabase.from("daily_logs").upsert({ user_id: userId, log_date: extracted.date }, { onConflict: "user_id,log_date" }).select("id").single();
  if (logError) throw logError;
  const { data: rawInput, error: rawError } = await supabase.from("raw_inputs").insert({ user_id: userId, daily_log_id: dailyLog.id, raw_text: extracted.rawText, source, parser_version: process.env.OPENAI_API_KEY ? "openai-json-schema-v1" : "heuristic-v1", extraction: extracted }).select("id").single();
  if (rawError) throw rawError;

  for (const meal of extracted.meals) {
    await insertMeal(userId, dailyLog.id, meal, rawInput.id);
  }
  for (const exercise of extracted.exercises) {
    await insertExercise(userId, dailyLog.id, exercise, rawInput.id);
  }
  return getDaySummary(userId, extracted.date);
}

export async function insertMeal(userId: string, dailyLogId: string, meal: Meal, rawInputId?: string) {
  const supabase = createSupabaseAdminClient();
  const totals = meal.items.reduce((acc, item) => ({ calories: acc.calories + item.calories, proteinGrams: acc.proteinGrams + item.proteinGrams, carbsGrams: acc.carbsGrams + item.carbsGrams, fatGrams: acc.fatGrams + item.fatGrams }), { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 });
  const { data, error } = await supabase.from("meals").insert({ user_id: userId, daily_log_id: dailyLogId, meal_type: meal.mealType, title: meal.title, eaten_at: meal.eatenAt, confidence: meal.confidence, assumptions: meal.assumptions, total_calories: round(totals.calories), total_protein_grams: round(totals.proteinGrams, 1), total_carbs_grams: round(totals.carbsGrams, 1), total_fat_grams: round(totals.fatGrams, 1), raw_input_id: rawInputId }).select("id").single();
  if (error) throw error;
  for (const item of meal.items) {
    await supabase.from("food_items").insert({ user_id: userId, meal_id: data.id, name: item.name, portion_description: item.portionDescription, grams: item.grams, calories: item.calories, protein_grams: item.proteinGrams, carbs_grams: item.carbsGrams, fat_grams: item.fatGrams, confidence: item.confidence, assumptions: item.assumptions });
  }
  return data.id as string;
}

export async function insertExercise(userId: string, dailyLogId: string, exercise: Exercise, rawInputId?: string) {
  const supabase = createSupabaseAdminClient();
  const estimated = exercise.caloriesBurned === undefined ? estimateExercise(exercise.activity, exercise.durationMinutes, exercise.intensity) : exercise;
  const { data, error } = await supabase.from("exercises").insert({ user_id: userId, daily_log_id: dailyLogId, activity: estimated.activity, duration_minutes: estimated.durationMinutes, intensity: estimated.intensity, calories_burned: estimated.caloriesBurned, confidence: estimated.confidence, assumptions: estimated.assumptions, raw_input_id: rawInputId }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function ensureDailyLog(userId: string, date: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("daily_logs").upsert({ user_id: userId, log_date: date }, { onConflict: "user_id,log_date" }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function getDaySummary(userId: string, date = todayIso()): Promise<DaySummary> {
  const supabase = createSupabaseAdminClient();
  const { data: log } = await supabase.from("daily_logs").select("id").eq("user_id", userId).eq("log_date", date).maybeSingle();
  if (!log) return emptyDay(date);

  const [{ data: meals }, { data: exercises }, { data: rawInputs }] = await Promise.all([
    supabase.from("meals").select("*, food_items(*)").eq("daily_log_id", log.id).order("created_at"),
    supabase.from("exercises").select("*").eq("daily_log_id", log.id).order("created_at"),
    supabase.from("raw_inputs").select("extraction").eq("daily_log_id", log.id).order("created_at", { ascending: false }).limit(5)
  ]);

  const mappedMeals: Meal[] = (meals ?? []).map((meal) => ({
    id: meal.id,
    mealType: meal.meal_type,
    title: meal.title,
    eatenAt: meal.eaten_at,
    confidence: Number(meal.confidence),
    assumptions: meal.assumptions ?? [],
    items: (meal.food_items ?? []).map(mapFoodItem)
  }));
  const mappedExercises: Exercise[] = (exercises ?? []).map((exercise) => ({ id: exercise.id, activity: exercise.activity, durationMinutes: exercise.duration_minutes, intensity: exercise.intensity, caloriesBurned: exercise.calories_burned, confidence: Number(exercise.confidence), assumptions: exercise.assumptions ?? [] }));
  return summarize(date, mappedMeals, mappedExercises, (rawInputs ?? []).flatMap((row) => row.extraction?.questions ?? []));
}

export async function getWeeklySummary(userId: string, startDate = startOfWeekIso()): Promise<WeeklySummary> {
  const days = await Promise.all(Array.from({ length: 7 }, (_, index) => getDaySummary(userId, addDays(startDate, index))));
  return {
    startDate,
    endDate: addDays(startDate, 6),
    days,
    totals: {
      consumedCalories: round(days.reduce((sum, day) => sum + day.consumed.calories, 0)),
      burnedCalories: round(days.reduce((sum, day) => sum + day.burned, 0)),
      netCalories: round(days.reduce((sum, day) => sum + day.netCalories, 0)),
      proteinGrams: round(days.reduce((sum, day) => sum + day.consumed.proteinGrams, 0), 1),
      carbsGrams: round(days.reduce((sum, day) => sum + day.consumed.carbsGrams, 0), 1),
      fatGrams: round(days.reduce((sum, day) => sum + day.consumed.fatGrams, 0), 1)
    }
  };
}

function mapFoodItem(item: Record<string, any>): FoodItem {
  return { id: item.id, name: item.name, portionDescription: item.portion_description, grams: item.grams, calories: item.calories, proteinGrams: item.protein_grams, carbsGrams: item.carbs_grams, fatGrams: item.fat_grams, confidence: Number(item.confidence), assumptions: item.assumptions ?? [] };
}

function summarize(date: string, meals: Meal[], exercises: Exercise[], questions: string[] = []): DaySummary {
  const consumed = meals.flatMap((meal) => meal.items).reduce((acc, item) => ({ calories: acc.calories + item.calories, proteinGrams: acc.proteinGrams + item.proteinGrams, carbsGrams: acc.carbsGrams + item.carbsGrams, fatGrams: acc.fatGrams + item.fatGrams }), { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 });
  const burned = exercises.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0);
  const confidences = [...meals.map((meal) => meal.confidence), ...meals.flatMap((meal) => meal.items.map((item) => item.confidence)), ...exercises.map((exercise) => exercise.confidence)];
  return { date, consumed: { calories: round(consumed.calories), proteinGrams: round(consumed.proteinGrams, 1), carbsGrams: round(consumed.carbsGrams, 1), fatGrams: round(consumed.fatGrams, 1) }, burned: round(burned), netCalories: round(consumed.calories - burned), confidence: confidences.length ? round(confidences.reduce((sum, score) => sum + score, 0) / confidences.length, 2) : 0, meals, exercises, questions };
}

function emptyDay(date: string): DaySummary {
  return summarize(date, [], [], []);
}
