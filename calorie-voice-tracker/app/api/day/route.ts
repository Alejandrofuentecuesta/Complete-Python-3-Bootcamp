import { NextResponse } from "next/server";
import { getDaySummary } from "@/lib/dayStore";
import { dateSchema } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/supabaseServer";
import { todayIso } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = dateSchema.optional().parse(searchParams.get("date") ?? todayIso());
  const userId = await getCurrentUserId();
  return NextResponse.json(await getDaySummary(userId, date));
}
