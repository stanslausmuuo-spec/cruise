import { expect } from "vitest";
import axe, { type AxeResults } from "axe-core";

export async function expectNoAxeViolations(
  container: HTMLElement,
  rulesToDisable: string[] = []
): Promise<void> {
  const results: AxeResults = await axe.run(container, {
    rules: Object.fromEntries(rulesToDisable.map((r) => [r, { enabled: false }])),
  });

  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.length,
  }));

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}
