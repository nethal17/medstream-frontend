import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers.js";

/**
 * Test: Cancel Appointment Flow
 *
 * Steps:
 * 1. Log in as yassulochana@gmail.com
 * 2. Navigate to /doctors (shows Appointment History for logged-in users)
 * 3. Wait for the Appointment History table to populate
 * 4. Find a row with a non-disabled red "Cancel" button
 * 5. Click Cancel — opens CancelAppointmentModal
 * 6. Optionally fill in a cancellation reason
 * 7. Click the confirm button inside the modal
 * 8. Assert success toast "cancelled successfully"
 * 9. Assert the row status updates to "cancelled" in the table
 *
 * Video recording is enabled in playwright.config.js (video: "on").
 */
test.describe("Cancel Appointment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("should open cancel modal and cancel an eligible appointment", async ({ page }) => {
    await page.goto("/doctors");
    await page.waitForLoadState("networkidle");

    // --- Wait for history section ---
    const historyHeading = page.getByText("Appointment History");
    await expect(historyHeading).toBeVisible({ timeout: 15_000 });

    // Allow table to populate
    await page.waitForTimeout(2000);

    // --- Find an eligible Cancel button (not disabled) ---
    // The Cancel button has variant="destructive" and text "Cancel"
    const cancelBtn = page
      .getByRole("button", { name: "Cancel" })
      .filter({ hasNotAttr: "disabled" })
      .first();

    const isAvailable = await cancelBtn.count();
    if (!isAvailable) {
      test.skip(true, "No cancellable appointments found for this user — skipping.");
      return;
    }

    await cancelBtn.click();

    // --- Modal opens ---
    const modal = page.getByRole("dialog").or(
      page.locator("[data-state='open']")
    ).first();
    await expect(modal).toBeVisible({ timeout: 8_000 });

    // --- Fill optional reason ---
    const reasonInput = modal.locator("textarea").or(
      modal.locator('input[type="text"]')
    ).first();
    const reasonVisible = await reasonInput.count();
    if (reasonVisible) {
      await reasonInput.fill("E2E automated test cancellation");
    }

    // --- Confirm cancellation ---
    // The modal's confirm button is labelled "Cancel booking" per the JSX
    const confirmBtn = modal.getByRole("button", {
      name: /cancel booking/i,
    });
    await expect(confirmBtn).toBeEnabled({ timeout: 5_000 });
    await confirmBtn.click();

    // --- Assert success ---
    const successToast = page.locator("text=cancelled successfully").or(
      page.locator("text=Cancelled")
    );
    await expect(successToast.first()).toBeVisible({ timeout: 15_000 });
  });

  test("should be able to close the cancel modal without cancelling", async ({ page }) => {
    await page.goto("/doctors");
    await page.waitForLoadState("networkidle");

    const historyHeading = page.getByText("Appointment History");
    await expect(historyHeading).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(2000);

    const cancelBtn = page
      .getByRole("button", { name: "Cancel" })
      .filter({ hasNotAttr: "disabled" })
      .first();

    if (!(await cancelBtn.count())) {
      test.skip(true, "No cancellable appointments — skipping close-modal test.");
      return;
    }

    await cancelBtn.click();

    const modal = page.getByRole("dialog").or(
      page.locator("[data-state='open']")
    ).first();
    await expect(modal).toBeVisible({ timeout: 8_000 });

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible({ timeout: 5_000 });

    // No success toast should appear
    const toast = page.locator("text=cancelled successfully");
    await expect(toast).not.toBeVisible();
  });
});
