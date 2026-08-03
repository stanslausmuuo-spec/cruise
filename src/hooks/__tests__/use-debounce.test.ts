import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello"));
    expect(result.current).toBe("hello");
  });

  it("does not update before the delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "first" },
    });
    rerender({ value: "second" });
    advance(100);
    expect(result.current).toBe("first");
  });

  it("updates after the delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    advance(300);
    expect(result.current).toBe("b");
  });

  it("resets the timer when the value changes again", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    advance(200);
    rerender({ value: "c" });
    advance(200);
    expect(result.current).toBe("a");
    advance(100);
    expect(result.current).toBe("c");
  });

  it("uses a custom delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    advance(500);
    expect(result.current).toBe("a");
    advance(500);
    expect(result.current).toBe("b");
  });
});