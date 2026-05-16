import { NextResponse } from "next/server";
import { patchEntryRequestSchema } from "@/lib/schemas";
import { createSupabaseAdminClient, getCurrentUserId } from "@/lib/supabaseServer";

const tableByType = {
  meal: "meals",
  food_item: "food_items",
  exercise: "exercises"
} as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = patchEntryRequestSchema.parse(await request.json());
  const userId = await getCurrentUserId();
  const supabase = createSupabaseAdminClient();
  const table = tableByType[body.entryType as keyof typeof tableByType];
  const before = await supabase.from(table).select("*").eq("id", params.id).eq("user_id", userId).maybeSingle();
  if (!before.data) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  if (body.operation === "delete") {
    const { error } = await supabase.from(table).delete().eq("id", params.id).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(table).update(toSnakePatch(body.patch)).eq("id", params.id).eq("user_id", userId);
    if (error) throw error;
  }

  await supabase.from("correction_history").insert({ user_id: userId, entry_id: params.id, entry_type: body.entryType, operation: body.operation, patch: body.patch, before_value: before.data, reason: body.reason, raw_text: body.rawText });
  return NextResponse.json({ ok: true });
}

function toSnakePatch(patch: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(patch).map(([key, value]) => [key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), value]));
}
