import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/e2e/**", "**/node_modules/**", "**/build/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      exclude: [
        "**/node_modules/**",
        "**/__tests__/**",
        "**/_generated/**",
        "**/src/app/**",
        "**/convex/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@convex": path.resolve(__dirname, "convex"),
      "convex/_generated": path.resolve(__dirname, "convex/_generated"),
    },
  },
});
