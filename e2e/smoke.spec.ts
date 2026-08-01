import { test, expect } from "@playwright/test";

type Opts = { method?: string; data?: unknown; headers?: Record<string, string> };

async function http(
  request: import("@playwright/test").APIRequestContext,
  path: string,
  opts: Opts = {}
) {
  const headers: Record<string, string> = { "content-type": "application/json", ...opts.headers };
  return request.fetch(path, {
    method: opts.method ?? "GET",
    data: opts.data,
    headers: opts.data ? headers : {},
  });
}

test.describe("Public page smoke tests", () => {
  const publicPages = [
    "/",
    "/about",
    "/how-it-works",
    "/contact",
    "/privacy",
    "/terms",
    "/trust-safety",
    "/vehicles",
    "/vehicles/map",
    "/offline",
    "/refunds",
  ];

  for (const path of publicPages) {
    test(`GET ${path} returns 200`, async ({ request }) => {
      const res = await http(request, path);
      expect(res.status()).toBe(200);
    });
  }
});

test.describe("Auth page smoke tests", () => {
  test("/login renders and links to register", async ({ request }) => {
    const res = await http(request, "/login");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('href="/register"');
    expect(html).toMatch(/Create one/i);
  });

  test("/register renders with an email field", async ({ request }) => {
    const res = await http(request, "/register");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('id="email"');
    expect(html).toContain('id="password"');
    expect(html).toContain('id="confirmPassword"');
  });
});

test.describe("Vehicle listing smoke", () => {
  test("vehicles page renders vehicle links", async ({ request }) => {
    const res = await http(request, "/vehicles");
    const html = await res.text();
    expect(html).toMatch(/href="\/vehicles\/[^"]+"/);
  });

  test("vehicle detail page returns 200 or 404", async ({ request }) => {
    const res = await http(request, "/vehicles/nonexistent-id");
    expect([200, 404]).toContain(res.status());
  });
});

test.describe("Route protection smoke", () => {
  const protectedRoutes = ["/dashboard", "/dashboard/host/bookings", "/vehicles/new", "/messages"];

  for (const route of protectedRoutes) {
    test(`GET ${route} without auth redirects to login`, async ({ request }) => {
      // request API follows redirects by default; final URL must land on /login.
      const res = await http(request, route, { headers: { "x-forwarded-for": "198.51.100.33" } });
      expect(res.status()).toBe(200);
      expect(res.url()).toMatch(/\/login/);
    });
  }

  test("/admin redirects to login", async ({ request }) => {
    const res = await http(request, "/admin", { headers: { "x-forwarded-for": "198.51.100.44" } });
    expect(res.status()).toBe(200);
    expect(res.url()).toMatch(/\/login/);
  });
});

test.describe("Security response headers", () => {
  for (const route of ["/", "/about", "/vehicles", "/login", "/offline"]) {
    test(`GET ${route} returns security headers`, async ({ request }) => {
      const res = await http(request, route);
      const headers = res.headers();
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-xss-protection"]).toBe("1; mode=block");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      const csp = headers["content-security-policy"];
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      // CSP must permit Convex WebSocket connections (wss://)
      expect(csp).toMatch(/wss:/);
    });
  }
});

test.describe("API contract smoke", () => {
  test("GET /api/mapbox/token returns token or null without leaking the raw secret", async ({
    request,
  }) => {
    const res = await http(request, "/api/mapbox/token");
    const body = await res.json();
    expect(body?.token === null || (body?.token && body.token.startsWith("pk."))).toBe(true);
  });

  test("POST /api/mpesa/stkpush without auth returns 401 (with allowed origin)", async ({
    request,
  }) => {
    const res = await http(request, "/api/mpesa/stkpush", {
      method: "POST",
      data: { phoneNumber: "0712345678", amount: 1000, type: "featured" },
      headers: { origin: "http://localhost:3000", "x-forwarded-for": "198.51.100.11" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/mpesa/stkpush rejects non-whitelisted amount (auth gate)", async ({ request }) => {
    const res = await http(request, "/api/mpesa/stkpush", {
      method: "POST",
      data: { phoneNumber: "0712345678", amount: 500, type: "featured" },
      headers: { origin: "http://localhost:3000", "x-forwarded-for": "198.51.100.22" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/auth/otp/send enforces rate limit after repeated attempts (same email)", async ({
    request,
  }) => {
    const email = "otp-ratelimit@example.com";
    let lastStatus = 200;
    for (let i = 0; i < 6; i++) {
      const res = await http(request, "/api/auth/otp/send", {
        method: "POST",
        data: { email, type: "email_verification" },
        headers: { origin: "http://localhost:3000", "x-forwarded-for": "203.0.113.77" },
      });
      lastStatus = res.status();
    }
    expect(lastStatus).toBe(429);
  });

  test("POST /api/auth/otp/send rejects invalid OTP type", async ({ request }) => {
    const res = await http(request, "/api/auth/otp/send", {
      method: "POST",
      data: { email: "invalidtype@example.com", type: "bogus_type" },
      headers: { origin: "http://localhost:3000", "x-forwarded-for": "203.0.113.81" },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/auth/otp/send rejects missing fields", async ({ request }) => {
    const res = await http(request, "/api/auth/otp/send", {
      method: "POST",
      data: {},
      headers: { origin: "http://localhost:3000", "x-forwarded-for": "203.0.113.92" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("Runtime / client-rendered smoke", () => {
  test("key pages render without unhandled JS errors", async ({ page }) => {
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on("pageerror", (e) => jsErrors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    for (const url of ["/", "/about", "/vehicles"]) {
      jsErrors.length = 0;
      consoleErrors.length = 0;
      await page.goto(url, { waitUntil: "load" });
      const fatal = [...jsErrors, ...consoleErrors].filter(
        (e) => !/favicon\.ico/.test(e) && !/Failed to load resource/.test(e)
      );
      expect(fatal, `JS/console errors on ${url}: ${JSON.stringify(fatal)}`).toEqual([]);
    }
  });
});
