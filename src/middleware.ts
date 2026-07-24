import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRateLimit } from "@/lib/rate-limit";
import {
  validateCSRFToken,
  getCSRFFromCookie,
  CSRF_HEADER_NAME,
} from "@/lib/csrf";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_URL,
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

  // CSRF protection for state-changing API requests
  // Skip M-Pesa callback (uses HMAC) and auth proxy (has its own rate limiting)
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) &&
      pathname.startsWith("/api/") &&
      !pathname.startsWith("/api/mpesa/callback") &&
      !pathname.startsWith("/api/auth/signin")) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    if (!isValidOrigin(origin, referer)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate CSRF token for authenticated requests
    const cookieHeader = request.headers.get("cookie") ?? undefined;
    const csrfCookie = getCSRFFromCookie(cookieHeader);
    const csrfHeader = request.headers.get(CSRF_HEADER_NAME);

    if (csrfCookie && csrfHeader) {
      if (!validateCSRFToken(csrfHeader, csrfCookie)) {
        return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
      }
    } else if (request.cookies.get("__convexAuthToken")) {
      // Authenticated requests must have CSRF token
      return NextResponse.json({ error: "Missing CSRF token" }, { status: 403 });
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

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  // Content-Security-Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/api/:path*", "/dashboard/:path*", "/vehicles/:path*", "/messages"],
};
