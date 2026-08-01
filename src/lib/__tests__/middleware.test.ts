import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { hashCSRFToken, generateCSRFToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf";

const ALLOWED_ORIGIN = "http://localhost:3000";

let middleware: typeof import("../../middleware").middleware;

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_URL", ALLOWED_ORIGIN);
  middleware = (await import("../../middleware")).middleware;
});

function makeRequest({
  path,
  method = "GET",
  origin,
  referer,
  cookie,
  headers = {},
  ip,
}: {
  path: string;
  method?: string;
  origin?: string;
  referer?: string;
  cookie?: string;
  headers?: Record<string, string>;
  ip?: string;
}) {
  const url = `http://localhost:3000${path}`;
  const reqHeaders: Record<string, string> = { ...headers };
  if (origin) reqHeaders.origin = origin;
  if (referer) reqHeaders.referer = referer;
  if (cookie) reqHeaders.cookie = cookie;
  if (ip) reqHeaders["x-forwarded-for"] = ip;
  return new NextRequest(url, { method, headers: reqHeaders });
}

describe("middleware — security headers", () => {
  it("sets all security headers on responses", async () => {
    const res = await middleware(makeRequest({ path: "/" }));
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });
});

describe("middleware — CSRF protection", () => {
  it("blocks state-changing requests with no origin and no referer", async () => {
    const res = await middleware(
      makeRequest({ path: "/api/upload", method: "POST" })
    );
    expect(res.status).toBe(403);
  });

  it("blocks state-changing requests with a foreign origin", async () => {
    const res = await middleware(
      makeRequest({ path: "/api/upload", method: "POST", origin: "https://evil.example.com" })
    );
    expect(res.status).toBe(403);
  });

  it("blocks state-changing requests with a foreign referer", async () => {
    const res = await middleware(
      makeRequest({ path: "/api/upload", method: "POST", referer: "https://evil.example.com/x" })
    );
    expect(res.status).toBe(403);
  });

  it("allows state-changing requests from an allowed origin without CSRF cookie", async () => {
    const res = await middleware(
      makeRequest({ path: "/api/upload", method: "POST", origin: ALLOWED_ORIGIN })
    );
    expect(res.status).not.toBe(403);
  });

  it("blocks authenticated requests that are missing the CSRF header", async () => {
    const res = await middleware(
      makeRequest({
        path: "/api/upload",
        method: "POST",
        origin: ALLOWED_ORIGIN,
        cookie: "__convexAuthToken=abc",
      })
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Missing CSRF token");
  });

  it("blocks authenticated requests with an invalid CSRF header", async () => {
    const badToken = generateCSRFToken();
    const goodHash = await hashCSRFToken("unrelated");
    const res = await middleware(
      makeRequest({
        path: "/api/upload",
        method: "POST",
        origin: ALLOWED_ORIGIN,
        cookie: `${CSRF_COOKIE_NAME}=${goodHash}; __convexAuthToken=abc`,
        headers: { [CSRF_HEADER_NAME]: badToken },
      })
    );
    expect(res.status).toBe(403);
  });

  it("allows authenticated requests with a valid CSRF token", async () => {
    const token = generateCSRFToken();
    const tokenHash = await hashCSRFToken(token);
    const res = await middleware(
      makeRequest({
        path: "/api/upload",
        method: "POST",
        origin: ALLOWED_ORIGIN,
        cookie: `${CSRF_COOKIE_NAME}=${tokenHash}; __convexAuthToken=abc`,
        headers: { [CSRF_HEADER_NAME]: token },
      })
    );
    expect(res.status).not.toBe(403);
  });

  it("skips CSRF check for the M-Pesa callback", async () => {
    const res = await middleware(
      makeRequest({ path: "/api/mpesa/callback", method: "POST" })
    );
    expect(res.status).not.toBe(403);
  });

  it("skips CSRF check for the auth signin proxy", async () => {
    const res = await middleware(
      makeRequest({ path: "/api/auth/signin", method: "POST" })
    );
    expect(res.status).not.toBe(403);
  });

  it("allows GET requests without origin", async () => {
    const res = await middleware(makeRequest({ path: "/api/health", method: "GET" }));
    expect(res.status).not.toBe(403);
  });
});

describe("middleware — rate limiting", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns 429 after exhausting payment rate limit", async () => {
    const { middleware: mw } = await import("../../middleware");
    let last: NextResponse = new NextResponse();
    for (let i = 0; i < 6; i++) {
      last = await mw(
        makeRequest({ path: "/api/mpesa/stkpush", method: "POST", origin: ALLOWED_ORIGIN, ip: "1.2.3.4" })
      );
    }
    expect(last.status).toBe(429);
  });

  it("does not rate limit the M-Pesa callback", async () => {
    const { middleware: mw } = await import("../../middleware");
    let last: NextResponse = new NextResponse();
    for (let i = 0; i < 6; i++) {
      last = await mw(makeRequest({ path: "/api/mpesa/callback", method: "POST", ip: "9.9.9.9" }));
    }
    expect(last.status).not.toBe(429);
  });
});

describe("middleware — route protection", () => {
  it("redirects unauthenticated /admin to login", async () => {
    const res = await middleware(makeRequest({ path: "/admin" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects unauthenticated /dashboard to login", async () => {
    const res = await middleware(makeRequest({ path: "/dashboard" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).toContain("redirect=");
  });

  it("redirects unauthenticated /vehicles/new to login", async () => {
    const res = await middleware(makeRequest({ path: "/vehicles/new" }));
    expect(res.status).toBe(307);
  });

  it("redirects unauthenticated vehicle edit page to login", async () => {
    const res = await middleware(makeRequest({ path: "/vehicles/abc123/edit" }));
    expect(res.status).toBe(307);
  });

  it("does not redirect authenticated users on protected pages", async () => {
    const res = await middleware(
      makeRequest({ path: "/dashboard", cookie: "__convexAuthToken=abc" })
    );
    expect(res.status).not.toBe(307);
  });

  it("does not redirect public vehicle pages", async () => {
    const res = await middleware(makeRequest({ path: "/vehicles/abc123" }));
    expect(res.status).not.toBe(307);
  });
});
