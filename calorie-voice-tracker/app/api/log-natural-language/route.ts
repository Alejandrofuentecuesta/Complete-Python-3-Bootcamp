import { NextResponse } from "next/server";
import { extractNaturalLanguageLog } from "@/lib/extraction";
import { saveExtractedLog } from "@/lib/dayStore";
import { naturalLanguageLogRequestSchema } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const body = naturalLanguageLogRequestSchema.parse(await request.json());
  const userId = await getCurrentUserId();
  const extracted = await extractNaturalLanguageLog(body);
  const summary = await saveExtractedLog(userId, extracted, body.source);
  return NextResponse.json({ extracted, summary });
}
