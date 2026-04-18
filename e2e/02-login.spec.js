import { test, expect } from "@playwright/test";
import { loginAsTestUser, TEST_USER } from "./helpers.js";

/**
 * Test: Patient Login Flow
 *
 * 1. Navigate to /login
 * 2. Fill email + password
 * 3. Submit
 * 4. Assert redirect to patient dashboard
 *
 * Video recording is enabled in playwright.config.js (video: "on").
 */
test.describe("Patient Login", () => {
  test("should log in with valid credentials and land on patient dashboard", async ({ page }) => {
    await loginAsTestUser(page);

    // After login, the patient should be sent to their home route
    // which is somewhere under /patient or /doctors
    await expect(page).not.toHaveURL(/\/login/);

    // Welcome toast
    const toast = page.locator("text=Welcome").or(page.locator("text=back"));
    await expect(toast.first()).toBeVisible({ timeout: 8_000 });
  });

  test("should show error toast for wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill("wrong-password-999");
    await page.getByRole("button", { name: "Sign in" }).click();

    const errorToast = page.locator("text=Invalid credentials").or(
      page.locator("text=failed")
    );
    await expect(errorToast.first()).toBeVisible({ timeout: 8_000 });

    // Should stay on login page
    expect(page.url()).toContain("/login");
  });

  test("should show error for empty fields", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Sign in" }).click();

    const errorToast = page.locator("text=required").or(
      page.locator("text=Email and password")
    );
    await expect(errorToast.first()).toBeVisible({ timeout: 5_000 });
  });
});
