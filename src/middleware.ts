import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             request.headers.get("x-real-ip") || 
             "unknown";

  // Rate limiting for auth endpoints
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/api/auth")) {
    const rateLimit = authRateLimit(`auth:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Rate limiting for payment endpoints
  if (pathname.startsWith("/api/mpesa") || pathname.startsWith("/api/payments")) {
    const rateLimit = authRateLimit(`payment:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many payment requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("__convexAuthToken")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const protectedPaths = ["/dashboard", "/vehicles/new", "/messages"];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  const isEditPage = /^\/vehicles\/[^/]+\/edit/.test(pathname);

  if (isProtected || isEditPage) {
    const token = request.cookies.get("__convexAuthToken")?.value;
    if (!token) {
      const redirectUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/login?redirect=${redirectUrl}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/api/auth/:path*", "/api/mpesa/:path*", "/api/payments/:path*", "/dashboard/:path*", "/vehicles/new", "/vehicles/*/edit", "/messages"],
};
