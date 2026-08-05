import { test, expect, type Page } from "@playwright/test";

const EMAIL = `qa.user.${Date.now()}@example.com`;
const PASSWORD = "TestPass123!";
const NAME = "QA Test User";
const PHONE = "+254712345678";

async function register(
  page: Page,
  opts: { email?: string; roles?: string[] } = {}
) {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

  await page.locator("#email").fill(opts.email ?? EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.locator("#confirmPassword").fill(PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Your Profile" })).toBeVisible();
  await page.locator("#name").fill(NAME);
  await page.locator("#phone").fill(PHONE);
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Your Role" })).toBeVisible();
  for (const role of opts.roles ?? ["renter", "host"]) {
    await page.getByRole("button", { name: new RegExp(role === "renter" ? "rent cars" : "list my car") }).click();
  }
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create Account" }).click();
}

test.describe("Account creation", () => {
  test("register a new account and land signed-in on home", async ({ page }) => {
    await register(page);

    await expect(page).toHaveURL(/\/$/, { timeout: 30000 });
    await expect(page.locator("body")).toContainText(/cruiselinx/i);
  });

  test("new account can access dashboard", async ({ page }) => {
    await register(page);

    await page.goto("/dashboard");
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("registration validates mismatched passwords", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#email").fill(`mm.${Date.now()}@example.com`);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#confirmPassword").fill("DifferentPass1");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
  });

  test("registration validates missing role selection", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#email").fill(`nroles.${Date.now()}@example.com`);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#confirmPassword").fill(PASSWORD);
    await page.getByRole("button", { name: "Continue" }).click();

    await page.locator("#name").fill(NAME);
    await page.locator("#phone").fill(PHONE);
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Your Role" })).toBeVisible();
    const submit = page.getByRole("button", { name: "Create Account" });
    await expect(submit).toBeDisabled();
  });

  test("login page links to register", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /create one|register/i })).toBeVisible();
  });
});
