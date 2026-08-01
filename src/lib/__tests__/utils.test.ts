import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatDate,
  formatTime,
  maskPhone,
  maskEmail,
  getInitials,
} from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });
});

describe("formatCurrency", () => {
  it("formats KES currency with commas", () => {
    expect(formatCurrency(1000)).toContain("1,000");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });

  it("formats large amounts", () => {
    expect(formatCurrency(100000)).toContain("100,000");
  });

  it("uses custom currency", () => {
    const result = formatCurrency(500, "USD");
    expect(result).toContain("500");
  });
});

describe("formatDate", () => {
  it("formats short date", () => {
    const result = formatDate(new Date(2025, 0, 15), "short");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("formats long date", () => {
    const result = formatDate(new Date(2025, 0, 15), "long");
    expect(result).toContain("Wednesday");
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("formats relative - just now", () => {
    const now = new Date();
    expect(formatDate(now, "relative")).toBe("Just now");
  });

  it("formats relative - minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000);
    expect(formatDate(fiveMinAgo, "relative")).toBe("5m ago");
  });

  it("formats relative - hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000);
    expect(formatDate(threeHoursAgo, "relative")).toBe("3h ago");
  });

  it("formats relative - days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
    expect(formatDate(twoDaysAgo, "relative")).toBe("2d ago");
  });

  it("handles timestamp numbers", () => {
    const result = formatDate(1737000000000, "short");
    expect(result).toBeDefined();
  });
});

describe("formatTime", () => {
  it("formats time with hours and minutes", () => {
    const date = new Date(2025, 0, 15, 14, 30);
    const result = formatTime(date);
    expect(result).toContain("14");
    expect(result).toContain("30");
  });
});

describe("maskPhone", () => {
  it("masks phone number", () => {
    expect(maskPhone("0712345678")).toBe("071****678");
  });

  it("returns short phone as-is", () => {
    expect(maskPhone("12345")).toBe("12345");
  });

  it("masks exactly 8 digit phone", () => {
    expect(maskPhone("12345678")).toBe("123****678");
  });
});

describe("maskEmail", () => {
  it("masks email", () => {
    expect(maskEmail("john@example.com")).toBe("j****n@example.com");
  });

  it("masks short name email", () => {
    expect(maskEmail("ab@example.com")).toBe("a****b@example.com");
  });

  it("returns invalid email as-is", () => {
    expect(maskEmail("invalid")).toBe("invalid");
  });
});

describe("getInitials", () => {
  it("gets initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("gets initials from single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("limits to two characters", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("converts to uppercase", () => {
    expect(getInitials("john doe")).toBe("JD");
  });
});
