import { NextResponse } from "next/server";
import { ensureDailyLog, getDaySummary, insertExercise } from "@/lib/dayStore";
import { estimateExercise } from "@/lib/nutrition";
import { createExerciseRequestSchema } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const body = createExerciseRequestSchema.parse(await request.json());
  const userId = await getCurrentUserId();
  const dailyLogId = await ensureDailyLog(userId, body.date);
  const estimate = body.caloriesBurned === undefined ? estimateExercise(body.activity, body.durationMinutes, body.intensity) : { activity: body.activity, durationMinutes: body.durationMinutes, intensity: body.intensity, caloriesBurned: body.caloriesBurned, confidence: 0.9, assumptions: ["Calories provided by caller."] };
  const exerciseId = await insertExercise(userId, dailyLogId, estimate);
  const summary = await getDaySummary(userId, body.date);
  return NextResponse.json({ exerciseId, summary }, { status: 201 });
}
