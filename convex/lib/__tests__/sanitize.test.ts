import { describe, it, expect } from "vitest";
import {
  sanitizeHtmlContent,
  sanitizePlainText,
  sanitizeDescription,
  sanitizeBio,
  sanitizeName,
  sanitizeAddress,
  sanitizeFeatures,
} from "../sanitize";

describe("sanitizeHtmlContent", () => {
  it("allows basic formatting tags", () => {
    expect(sanitizeHtmlContent("<p>Hello <b>world</b></p>")).toContain("<b>world</b>");
  });

  it("strips script tags", () => {
    const result = sanitizeHtmlContent("<p>hi</p><script>alert('xss')</script>");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  });

  it("strips javascript event handlers", () => {
    const result = sanitizeHtmlContent('<p onclick="alert(1)">hi</p>');
    expect(result).not.toContain("onclick");
    expect(result).not.toContain("alert");
  });

  it("strips javascript hrefs", () => {
    const result = sanitizeHtmlContent('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain("javascript:");
  });

  it("strips iframes", () => {
    const result = sanitizeHtmlContent('<iframe src="https://evil.com"></iframe>');
    expect(result).not.toContain("<iframe");
  });

  it("strips img tags", () => {
    const result = sanitizeHtmlContent('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("<img");
  });

  it("strips style blocks", () => {
    const result = sanitizeHtmlContent('<style>body{display:none}</style><p>ok</p>');
    expect(result).not.toContain("<style");
    expect(result).toContain("ok");
  });

  it("handles svg-based payloads", () => {
    const result = sanitizeHtmlContent('<svg><script>alert(1)</script></svg>');
    expect(result).not.toContain("<script");
    expect(result).not.toContain("<svg");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeHtmlContent("")).toBe("");
    expect(sanitizeHtmlContent(null as unknown as string)).toBe("");
  });
});

describe("sanitizePlainText", () => {
  it("removes all tags and trims", () => {
    expect(sanitizePlainText("<p>  hello <b>world</b>  </p>")).toBe("hello world");
  });

  it("strips script content", () => {
    expect(sanitizePlainText("<script>alert(1)</script>safe")).toBe("safe");
  });

  it("keeps plain text intact", () => {
    expect(sanitizePlainText("plain text")).toBe("plain text");
  });
});

describe("sanitizeDescription", () => {
  it("allows formatting but no scripts", () => {
    const result = sanitizeDescription("<p>Nice <b>car</b></p><script>alert(1)</script>");
    expect(result).toContain("<b>car</b>");
    expect(result).not.toContain("<script");
  });
});

describe("sanitizeBio", () => {
  it("removes lists from bio", () => {
    const result = sanitizeBio("<p>hi</p><ul><li>item</li></ul>");
    expect(result).not.toContain("<ul");
    expect(result).toContain("hi");
  });
});

describe("sanitizeName", () => {
  it("strips tags from names", () => {
    expect(sanitizeName("<b>John</b> Doe")).toBe("John Doe");
  });
});

describe("sanitizeAddress", () => {
  it("strips tags from addresses", () => {
    expect(sanitizeAddress('<img src=x onerror=alert(1)>Nairobi')).toBe("Nairobi");
  });
});

describe("sanitizeFeatures", () => {
  it("sanitizes and filters empty features", () => {
    expect(sanitizeFeatures(["<b>GPS</b>", "  ", "<script>alert(1)</script>", "Bluetooth"]))
      .toEqual(["GPS", "Bluetooth"]);
  });

  it("drops features longer than 50 chars", () => {
    expect(sanitizeFeatures(["x".repeat(51), "ok"])).toEqual(["ok"]);
  });

  it("handles empty array", () => {
    expect(sanitizeFeatures([])).toEqual([]);
  });
});
