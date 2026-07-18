import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Note: Auth protection is handled client-side via Supabase
// The middleware only handles static file serving
// This allows SPA routing to work properly with Supabase auth

export function middleware(request: NextRequest) {
  // Let all requests pass through
  // Client-side auth handles redirects based on session state
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
