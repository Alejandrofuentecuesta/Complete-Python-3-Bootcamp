import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseRouteClient() {
  const cookieStore = cookies();
  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: "", ...options });
        }
      }
    }
  );
}

export function createSupabaseAdminClient() {
  return createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false }
  });
}

export async function getCurrentUserId() {
  const requestHeaders = headers();
  const gptActionSecret = requestHeaders.get("x-gpt-action-secret");
  if (process.env.GPT_ACTION_SHARED_SECRET && gptActionSecret === process.env.GPT_ACTION_SHARED_SECRET) {
    return process.env.GPT_ACTION_USER_ID || process.env.DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const authHeader = requestHeaders.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase.auth.getUser(authHeader.slice(7));
      if (data.user?.id) return data.user.id;
    }
    try {
      const supabase = createSupabaseRouteClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.id) return data.user.id;
    } catch {
      // Dev mode can run without configured Supabase cookies.
    }
  }
  return process.env.DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
