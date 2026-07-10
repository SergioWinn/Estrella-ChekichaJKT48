import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string): string {
  const rawValue = process.env[name];
  const value = rawValue?.trim().replace(/^['"]|['"]$/g, "");
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createAdminSupabaseClient() {
  return createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
