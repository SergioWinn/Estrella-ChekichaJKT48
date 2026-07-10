import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

function requiredEnv(name: string): string {
  const rawValue = process.env[name];
  const value = rawValue?.trim().replace(/^['"]|['"]$/g, "");
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = () => requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = () => requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can't always mutate cookies.
        }
      },
    },
  });
}

export async function createActionSupabaseClient() {
  return createServerSupabaseClient();
}

export function createMiddlewareSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  return { supabase, response };
}

export function setCookieOnResponse(response: NextResponse, name: string, value: string, options?: CookieOptions) {
  response.cookies.set(name, value, options);
}
