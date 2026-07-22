import { NextResponse } from "next/server";
import { fetchAction } from "convex/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { authRateLimit } from "@/lib/rate-limit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const body = await request.json();

    // Accept both full format { action, args } and simplified { email, password, flow }
    const email = body.args?.params?.email ?? body.email;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const flow = body.args?.params?.flow ?? body.flow ?? "signIn";

    const rateLimitKey = flow === "signUp" ? `register:${email}:${ip}` : `login:${email}:${ip}`;
    const rateLimit = authRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      const diff = rateLimit.resetTime - Date.now();
      const retryAfter = Number.isFinite(diff) ? Math.max(1, Math.ceil(diff / 60000)) : 1;

      // Log rate-limited attempt
      void convex.mutation(api.audit.logEventPublic, {
        action: "auth_rate_limited",
        ip,
        userAgent,
        metadata: { email, flow, rateLimitKey },
      });

      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfter} minute${retryAfter === 1 ? "" : "s"}.` },
        { status: 429 }
      );
    }

    const args = body.args ?? {
      provider: "password",
      params: { email, password: body.password, flow },
    };

    let result;
    try {
      result = await fetchAction("auth:signIn" as unknown as Parameters<typeof fetchAction>[0], args);

      // Log successful auth
      void convex.mutation(api.audit.logEventPublic, {
        action: flow === "signUp" ? "user_registered" : "user_signed_in",
        ip,
        userAgent,
        metadata: { email, flow },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Authentication failed";

      // Log failed auth
      void convex.mutation(api.audit.logEventPublic, {
        action: "auth_failed",
        ip,
        userAgent,
        metadata: { email, flow, error: message },
      });

      const response = NextResponse.json({ error: message }, { status: 400 });
      response.cookies.set("__convexAuthJWT", "", { maxAge: -1, path: "/" });
      response.cookies.set("__convexAuthRefreshToken", "", { maxAge: -1, path: "/" });
      return response;
    }

    if (result.tokens !== undefined) {
      const response = NextResponse.json({
        tokens: result.tokens !== null
          ? { token: result.tokens.token, refreshToken: "dummy" }
          : null,
      });

      if (result.tokens !== null) {
        response.cookies.set("__convexAuthJWT", result.tokens.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        response.cookies.set("__convexAuthRefreshToken", result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }

      return response;
    }

    if (result.redirect !== undefined) {
      return NextResponse.json({ redirect: result.redirect });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Auth proxy error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
