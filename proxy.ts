import { NextResponse, type NextRequest } from "next/server";

import { createMiddlewareSupabaseClient } from "@/lib/supabase-ssr.ts";
import { getAuthRedirectPath } from "@/lib/v2-helpers.ts";

export async function proxy(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/collection");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let profile: { role?: string | null } | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    profile = data;
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(getAuthRedirectPath(profile), request.url));
  }

  if (pathname.startsWith("/admin") && user && profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/collection/:path*", "/login", "/signup"],
};
