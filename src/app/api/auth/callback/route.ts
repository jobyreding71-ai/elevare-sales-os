import { NextResponse } from "next/server";

// Handle OAuth callback from Supabase
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    // The code will be exchanged for a session by Supabase automatically
    // We just need to redirect to the dashboard
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
