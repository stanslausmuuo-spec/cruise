import { describe, it, expect } from "vitest";
import { sha256 } from "../crypto";

describe("sha256", () => {
  it("matches the known SHA-256 vector for empty string", async () => {
    expect(await sha256("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });

  it("matches the known SHA-256 vector for 'abc'", async () => {
    expect(await sha256("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("produces 64 hex chars", async () => {
    const hash = await sha256("anything");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", async () => {
    const a = await sha256("same input");
    const b = await sha256("same input");
    expect(a).toBe(b);
  });

  it("differs for different inputs", async () => {
    const a = await sha256("input one");
    const b = await sha256("input two");
    expect(a).not.toBe(b);
  });
});
