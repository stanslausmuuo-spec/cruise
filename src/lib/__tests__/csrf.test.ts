import { describe, it, expect } from "vitest";
import {
  generateCSRFToken,
  hashCSRFToken,
  validateCSRFToken,
  getCSRFFromCookie,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "../csrf";

describe("generateCSRFToken", () => {
  it("generates a 64-char hex token", () => {
    const token = generateCSRFToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates unique tokens", () => {
    const a = generateCSRFToken();
    const b = generateCSRFToken();
    expect(a).not.toBe(b);
  });
});

describe("hashCSRFToken", () => {
  it("produces a sha256 hex digest", async () => {
    const hash = await hashCSRFToken("some-token");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same input", async () => {
    const a = await hashCSRFToken("token");
    const b = await hashCSRFToken("token");
    expect(a).toBe(b);
  });
});

describe("validateCSRFToken", () => {
  it("accepts a valid token/hash pair", async () => {
    const token = generateCSRFToken();
    const hash = await hashCSRFToken(token);
    expect(await validateCSRFToken(token, hash)).toBe(true);
  });

  it("rejects a wrong token", async () => {
    const token = generateCSRFToken();
    const hash = await hashCSRFToken(token);
    expect(await validateCSRFToken(generateCSRFToken(), hash)).toBe(false);
  });

  it("rejects empty token", async () => {
    const hash = await hashCSRFToken("token");
    expect(await validateCSRFToken("", hash)).toBe(false);
  });

  it("rejects empty hash", async () => {
    expect(await validateCSRFToken("token", "")).toBe(false);
  });

  it("rejects null-ish values", async () => {
    expect(await validateCSRFToken("token", "not-a-hash")).toBe(false);
  });
});

describe("getCSRFFromCookie", () => {
  it("parses the CSRF cookie from a cookie header", () => {
    const header = `session=abc; ${CSRF_COOKIE_NAME}=sometoken123; other=xyz`;
    expect(getCSRFFromCookie(header)).toBe("sometoken123");
  });

  it("parses cookie that is the first in the header", () => {
    const header = `${CSRF_COOKIE_NAME}=tokenvalue; session=abc`;
    expect(getCSRFFromCookie(header)).toBe("tokenvalue");
  });

  it("returns null when cookie is missing", () => {
    expect(getCSRFFromCookie("session=abc; other=xyz")).toBeNull();
  });

  it("returns null for undefined header", () => {
    expect(getCSRFFromCookie(undefined)).toBeNull();
  });

  it("handles cookie values containing equals signs", () => {
    const header = `${CSRF_COOKIE_NAME}=a=b=c; session=abc`;
    expect(getCSRFFromCookie(header)).toBe("a=b=c");
  });
});

describe("exports", () => {
  it("exposes expected constants", () => {
    expect(CSRF_COOKIE_NAME).toBe("__Host-csrf-token");
    expect(CSRF_HEADER_NAME).toBe("x-csrf-token");
  });
});
