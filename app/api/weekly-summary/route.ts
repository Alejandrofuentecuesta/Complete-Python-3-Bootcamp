import { NextResponse } from "next/server";
import { getWeeklySummary } from "@/lib/dayStore";
import { dateSchema } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/supabaseServer";
import { startOfWeekIso } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = dateSchema.optional().parse(searchParams.get("startDate") ?? startOfWeekIso());
  const userId = await getCurrentUserId();
  return NextResponse.json(await getWeeklySummary(userId, startDate));
}
