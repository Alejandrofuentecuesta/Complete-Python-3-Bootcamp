import { NextResponse } from "next/server";
import { ensureDailyLog, getDaySummary, insertMeal } from "@/lib/dayStore";
import { createMealRequestSchema } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const body = createMealRequestSchema.parse(await request.json());
  const userId = await getCurrentUserId();
  const dailyLogId = await ensureDailyLog(userId, body.date);
  const mealId = await insertMeal(userId, dailyLogId, {
    mealType: body.mealType,
    title: body.title,
    confidence: 0.85,
    assumptions: body.rawText ? [`Created from manual API input: ${body.rawText}`] : ["Created from manual API input."],
    items: body.items
  });
  const summary = await getDaySummary(userId, body.date);
  return NextResponse.json({ mealId, summary }, { status: 201 });
}
