import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    mutation: vi.fn(),
    query: vi.fn(),
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/mpesa", () => ({
  initiateSTKPush: vi.fn(),
  generateReference: vi.fn().mockReturnValue("REF123456789"),
}));

import { cookies } from "next/headers";
import { initiateSTKPush } from "@/lib/mpesa";

function requestWith(body?: unknown) {
  return new Request("http://localhost:3000/api/mpesa/stkpush", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("POST /api/mpesa/stkpush", () => {
  let POST: (req: Request) => Promise<Response>;
  const initiator = initiateSTKPush as unknown as ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://test.convex.cloud");
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "token123" }),
    });
    initiator.mockReset();
    initiator.mockResolvedValue({ success: true, transactionId: "ws_CO_123", message: "OK" });
    const mod = await import("../mpesa/stkpush/route");
    POST = mod.POST;
  });

  it("returns 401 without auth cookie", async () => {
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });
    const res = await POST(requestWith({ phoneNumber: "0712345678", amount: 1000, type: "featured" }));
    expect(res.status).toBe(401);
  });

  it("accepts a valid featured payment", async () => {
    const res = await POST(requestWith({ phoneNumber: "0712345678", amount: 1000, type: "featured" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.checkoutRequestId).toBe("ws_CO_123");
    expect(initiator).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "0712345678", amount: 1000 })
    );
  });

  it("rejects invalid JSON body", async () => {
    const res = await POST(new Request("http://localhost:3000/api/mpesa/stkpush", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{invalid json",
    }));
    expect(res.status).toBe(500);
  });

  it("rejects missing fields with 400", async () => {
    const res = await POST(requestWith({ type: "featured" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid request");
  });

  it("rejects non-whitelisted featured amount", async () => {
    const res = await POST(requestWith({ phoneNumber: "0712345678", amount: 500, type: "featured" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid plan amount");
  });

  it("rejects negative or zero amount", async () => {
    const res = await POST(requestWith({ phoneNumber: "0712345678", amount: -5, type: "featured" }));
    expect(res.status).toBe(400);
  });

  it("rejects unknown payment type", async () => {
    const res = await POST(requestWith({ phoneNumber: "0712345678", amount: 1000, type: "hack" as never }));
    expect(res.status).toBe(400);
  });

  it("rejects short phone numbers", async () => {
    const res = await POST(requestWith({ phoneNumber: "123", amount: 1000, type: "featured" }));
    expect(res.status).toBe(400);
  });

  it("propagates M-Pesa failures as 400", async () => {
    initiator.mockResolvedValue({ success: false, message: "STK push rejected" });
    const res = await POST(requestWith({ phoneNumber: "0712345678", amount: 1000, type: "featured" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("STK push rejected");
  });

  it("returns 500 when the provider throws", async () => {
    initiator.mockRejectedValue(new Error("network"));
    const res = await POST(requestWith({ phoneNumber: "0712345678", amount: 1000, type: "featured" }));
    expect(res.status).toBe(500);
  });

  it("passes through metadata", async () => {
    const res = await POST(
      requestWith({ phoneNumber: "0712345678", amount: 1000, type: "featured", metadata: { vehicleId: "v1" } })
    );
    const body = await res.json();
    expect(body.metadata).toEqual({ vehicleId: "v1" });
  });
});
