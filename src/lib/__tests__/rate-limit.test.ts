import { describe, it, expect, beforeEach, vi } from "vitest";

async function loadRateLimit() {
  vi.resetModules();
  return await import("../rate-limit");
}

describe("authRateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request", async () => {
    const { authRateLimit } = await loadRateLimit();
    const result = authRateLimit("test-key");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetTime).toBeGreaterThan(Date.now());
  });

  it("allows up to MAX_REQUESTS then blocks", async () => {
    const { authRateLimit } = await loadRateLimit();
    for (let i = 0; i < 5; i++) {
      const result = authRateLimit("key2");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
    const blocked = authRateLimit("key2");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks keys independently", async () => {
    const { authRateLimit } = await loadRateLimit();
    for (let i = 0; i < 5; i++) authRateLimit("busy-key");
    expect(authRateLimit("busy-key").allowed).toBe(false);
    expect(authRateLimit("fresh-key").allowed).toBe(true);
  });

  it("resets after the window expires", async () => {
    vi.useFakeTimers();
    const { authRateLimit } = await loadRateLimit();
    for (let i = 0; i < 5; i++) authRateLimit("expire-key");
    expect(authRateLimit("expire-key").allowed).toBe(false);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(authRateLimit("expire-key").allowed).toBe(true);
  });

  it("clearRateLimit resets a key", async () => {
    const { authRateLimit, clearRateLimit } = await loadRateLimit();
    for (let i = 0; i < 5; i++) authRateLimit("clear-key");
    expect(authRateLimit("clear-key").allowed).toBe(false);
    clearRateLimit("clear-key");
    expect(authRateLimit("clear-key").allowed).toBe(true);
  });
});
