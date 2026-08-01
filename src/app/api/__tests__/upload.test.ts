import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("convex/_generated/api", () => ({
  api: { storage: { generateUploadUrl: "convex.storage.generateUploadUrl" } },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn().mockImplementation(function () {
    return {
      mutation: vi.fn(),
      query: vi.fn(),
    };
  }),
}));

import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";

function requestWith(body?: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/upload", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("POST /api/upload", () => {
  let POST: (req: Request) => Promise<Response>;
  let mockMutation: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://test.convex.cloud");
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      get: vi.fn(),
    });
    const ConvexMock = ConvexHttpClient as unknown as ReturnType<typeof vi.fn>;
    ConvexMock.mockClear();
    mockMutation = vi.fn().mockResolvedValue("https://test.convex.cloud/storage/abc123");
    ConvexMock.mockImplementation(function () {
      return { mutation: mockMutation, query: vi.fn() };
    });
    const mod = await import("../upload/route");
    POST = mod.POST;
  });

  it("returns 401 when no auth cookie is present", async () => {
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });
    const res = await POST(requestWith());
    expect(res.status).toBe(401);
  });

  it("returns upload URL when authenticated", async () => {
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "token123" }),
    });
    const res = await POST(requestWith());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.uploadUrl).toContain("abc123");
    expect(body.storageId).toBe("abc123");
  });

  it("rate limits repeated requests", async () => {
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "token123" }),
    });
    let last = new Response();
    for (let i = 0; i < 6; i++) {
      last = await POST(requestWith({}, { "x-forwarded-for": "10.0.0.1" }));
    }
    expect(last.status).toBe(429);
  });

  it("returns 500 when convex fails", async () => {
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "token123" }),
    });
    mockMutation.mockRejectedValue(new Error("convex down"));
    const res = await POST(requestWith());
    expect(res.status).toBe(500);
  });

  it("returns 500 when NEXT_PUBLIC_CONVEX_URL is not set", async () => {
    vi.unstubAllEnvs();
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "token123" }),
    });
    const res = await POST(requestWith());
    expect(res.status).toBe(500);
  });
});
