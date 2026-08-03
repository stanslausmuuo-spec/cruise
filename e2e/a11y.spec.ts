import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const axeSource = fs.readFileSync(
  path.join(__dirname, "..", "node_modules", "axe-core", "axe.min.js"),
  "utf8"
);

const publicPages = [
  "/",
  "/about",
  "/how-it-works",
  "/contact",
  "/privacy",
  "/terms",
  "/trust-safety",
  "/refunds",
  "/vehicles",
  "/login",
  "/register",
];

async function scan(page: import("@playwright/test").Page) {
  await page.addScriptTag({ content: axeSource });
  return (await page.evaluate(async () => {
    const axe = (window as unknown as { axe: Record<string, unknown> }).axe;
    const run = axe.run as (document: Document, options: Record<string, unknown>) => Promise<{
      violations: Array<{ id: string; impact: string; nodes: unknown[]; help: string }>;
      passes: Array<{ id: string }>;
    }>;
    const results = await run(document, {
      runOnly: {
        type: "tag",
        values: [
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22a",
          "wcag22aa",
          "best-practice",
        ],
      },
    });
    return results.violations
      .filter((v) => v.nodes.length > 0)
      .map((v) => ({ id: v.id, impact: v.impact, count: v.nodes.length, help: v.help }));
  })) as Array<{ id: string; impact: string; count: number; help: string }>;
}

async function settle(page: import("@playwright/test").Page) {
  await documentFontsReady(page);
  await page.waitForTimeout(800);
  await page
    .waitForFunction(
      () => {
        const els = Array.from(document.querySelectorAll<HTMLElement>("[style*='opacity']"));
        return els.every((el) => {
          const o = parseFloat(el.style.opacity);
          return Number.isNaN(o) || o >= 1;
        });
      },
      undefined,
      { timeout: 8000 }
    )
    .catch(() => {});
}

async function documentFontsReady(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  }).catch(() => {});
}

test.describe("Accessibility scan (axe-core)", () => {
  for (const url of publicPages) {
    test(`axe scan on ${url} has no violations`, async ({ page }) => {
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await settle(page);
      const violations = await scan(page);
      expect(violations, `${url} a11y violations: ${JSON.stringify(violations)}`).toEqual([]);
    });
  }
});