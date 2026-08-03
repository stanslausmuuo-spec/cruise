import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("core pages meet navigation-timing budgets", async ({ page }) => {
    const budgets: Record<string, { ttfb: number; transfer: number }> = {
      "/": { ttfb: 1500, transfer: 6_000_000 },
      "/about": { ttfb: 1500, transfer: 3_000_000 },
      "/vehicles": { ttfb: 1500, transfer: 6_000_000 },
      "/login": { ttfb: 1500, transfer: 3_000_000 },
    };

    for (const [url, budget] of Object.entries(budgets)) {
      const response = await page.goto(url, { waitUntil: "load", timeout: 30000 });
      expect(response?.status(), `GET ${url}`).toBe(200);

      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const lcp = performance
          .getEntriesByType("largest-contentful-paint")
          .map((e) => (e as { startTime: number }).startTime);
        const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        return {
          ttfb: nav.responseStart - nav.requestStart,
          domContentLoaded: nav.domContentLoadedEventEnd,
          loadEvent: nav.loadEventEnd,
          lcpMs: lcp.length ? Math.max(...lcp) : null,
          totalBytes: resources.reduce((s, r) => s + (r.transferSize || 0), 0),
          requestCount: resources.length,
        };
      });

      expect(metrics.ttfb, `${url} TTFB ${metrics.ttfb}ms > ${budget.ttfb}ms`).toBeLessThan(budget.ttfb);
      expect(
        metrics.totalBytes,
        `${url} transfer ${metrics.totalBytes} bytes > ${budget.transfer}`
      ).toBeLessThan(budget.transfer);

      const report = {
        url,
        ttfb: `${metrics.ttfb}ms`,
        domContentLoaded: `${metrics.domContentLoaded}ms`,
        loadEvent: `${metrics.loadEvent}ms`,
        lcp: metrics.lcpMs === null ? "pending" : `${Math.round(metrics.lcpMs)}ms`,
        totalBytes: `${(metrics.totalBytes / 1024).toFixed(0)} KB`,
        requests: metrics.requestCount,
      };
      console.log(`PERF: ${JSON.stringify(report)}`);
    }
  });

  test("no single client bundle exceeds 1.5MB (raw)", async ({ page }) => {
    const responses: string[] = [];
    page.on("response", (res) => {
      const url = res.url();
      if (url.includes("/_next/") && url.endsWith(".js")) {
        responses.push(url);
      }
    });
    await page.goto("/", { waitUntil: "networkidle", timeout: 30000 });

    const sizes: Array<{ file: string; bytes: number }> = [];
    for (const url of responses) {
      const res = await page.request.get(url);
      const body = await res.body();
      sizes.push({ file: url.split("/").pop() ?? url, bytes: body.length });
    }

    const largest = sizes.sort((a, b) => b.bytes - a.bytes)[0];
    console.log(`LARGEST_JS: ${largest?.file} = ${((largest?.bytes ?? 0) / 1024).toFixed(0)}KB`);
    expect(largest?.bytes ?? 0, `largest JS chunk ${largest?.file}`).toBeLessThan(1_572_864);
  });
});