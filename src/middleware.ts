import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRateLimit } from "@/lib/rate-limit";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

function isValidOrigin(origin: string | null, referer: string | null): boolean {
  if (!origin && !referer) return false;
  const source = origin || referer || "";
  return ALLOWED_ORIGINS.some((allowed) => allowed && source.startsWith(allowed));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             request.headers.get("x-real-ip") || 
             "unknown";

  // CSRF protection for state-changing API requests (skip M-Pesa callback — uses HMAC)
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) &&
      pathname.startsWith("/api/") &&
      !pathname.startsWith("/api/mpesa/callback")) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    if (!isValidOrigin(origin, referer)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Rate limiting for auth endpoints (not M-Pesa callback — Safaricom server-to-server)
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/api/auth")) {
    const rateLimit = authRateLimit(`auth:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Rate limiting for payment endpoints (not M-Pesa callback)
  if ((pathname.startsWith("/api/mpesa") || pathname.startsWith("/api/payments")) && !pathname.startsWith("/api/mpesa/callback")) {
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

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/api/:path*", "/dashboard/:path*", "/vehicles/:path*", "/messages"],
};
