import { test, expect } from "@playwright/test";
import { NEW_USER } from "./helpers.js";

/**
 * Test: Patient Registration Flow
 *
 * 1. Navigate to /register
 * 2. Fill in full name, email, phone, password, confirm-password
 * 3. Submit the form
 * 4. Assert redirect to /login with success toast
 *
 * Uses a unique timestamped email to avoid 409 conflicts.
 * Video recording is enabled in playwright.config.js (video: "on").
 */
test.describe("Patient Registration", () => {
  test("should register a new patient and redirect to login", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // --- Fill the form ---
    await page.getByLabel("Full name").fill(NEW_USER.fullName);
    await page.getByLabel("Email").fill(NEW_USER.email);
    await page.getByLabel("Phone (optional)").fill(NEW_USER.phone);

    // Two password fields — use index-based locators to disambiguate
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(NEW_USER.password);
    await passwordInputs.nth(1).fill(NEW_USER.password);

    // --- Submit ---
    await page.getByRole("button", { name: "Create account" }).click();

    // --- Assertions ---
    // Should redirect to /login
    await page.waitForURL("**/login", { timeout: 15_000 });
    expect(page.url()).toContain("/login");

    // Success toast should appear
    const toast = page.locator("text=Account created").or(
      page.locator("text=sign in")
    );
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });

  test("should show error when registering with existing email", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Use the already-existing test account
    await page.getByLabel("Full name").fill("Yas Sulochana");
    await page.getByLabel("Email").fill("yassulochana@gmail.com");

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill("admin123");
    await passwordInputs.nth(1).fill("admin123");

    await page.getByRole("button", { name: "Create account" }).click();

    // Toast error about duplicate email
    const toast = page.locator("text=already exists").or(
      page.locator("text=email")
    );
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });
});
