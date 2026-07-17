import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/callback",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith("/api/auth")
  );

  // Check for auth token in cookies
  const authToken = request.cookies.get("sb-access-token")?.value;
  const hasAuthToken = !!authToken;

  // Redirect to login if accessing protected route without auth
  if (!isPublicRoute && !hasAuthToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while logged in
  if (hasAuthToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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
