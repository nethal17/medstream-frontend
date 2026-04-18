import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers.js";

/**
 * Test: Reschedule Appointment Flow
 *
 * Steps:
 * 1. Log in as yassulochana@gmail.com
 * 2. Navigate to /doctors (which shows Appointment History for logged-in users)
 * 3. Wait for the Appointment History section to load
 * 4. Find a row with a non-disabled "Reschedule" button (confirmed/pending status)
 * 5. Click Reschedule — opens RescheduleAppointmentModal
 * 6. Change the date to tomorrow
 * 7. Select the first available time option (or keep as-is)
 * 8. Click "Confirm Reschedule" in the modal
 * 9. Assert success toast "rescheduled successfully"
 *
 * Video recording is enabled in playwright.config.js (video: "on").
 */
test.describe("Reschedule Appointment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("should open reschedule modal and reschedule an eligible appointment", async ({ page }) => {
    await page.goto("/doctors");
    await page.waitForLoadState("networkidle");

    // --- Wait for history table ---
    const historyHeading = page.getByText("Appointment History");
    await expect(historyHeading).toBeVisible({ timeout: 15_000 });

    // Allow history rows to populate
    await page.waitForTimeout(2000);

    // --- Find an eligible Reschedule button (not disabled) ---
    const rescheduleBtn = page
      .getByRole("button", { name: "Reschedule" })
      .filter({ hasNotAttr: "disabled" })
      .first();

    const isAvailable = await rescheduleBtn.count();
    if (!isAvailable) {
      test.skip(true, "No reschedulable appointments found for this user — skipping.");
      return;
    }

    await rescheduleBtn.click();

    // --- Modal opens ---
    const modal = page.getByRole("dialog").or(
      page.locator("[data-state='open']")
    ).first();
    await expect(modal).toBeVisible({ timeout: 8_000 });

    // --- Change the date to tomorrow ---
    const dateInput = modal.locator('input[type="date"]').first();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await dateInput.fill(tomorrow.toISOString().slice(0, 10));
    await page.waitForTimeout(500);

    // --- Try to fill a new start time if input exists ---
    const timeInput = modal.locator('input[type="time"]').first();
    const timeInputVisible = await timeInput.count();
    if (timeInputVisible) {
      await timeInput.fill("09:00");
    }

    // --- Confirm ---
    const confirmBtn = modal.getByRole("button", {
      name: /confirm|reschedule/i,
    });
    await expect(confirmBtn).toBeEnabled({ timeout: 5_000 });
    await confirmBtn.click();

    // --- Assert success ---
    const successToast = page.locator("text=rescheduled successfully").or(
      page.locator("text=Rescheduled")
    );
    await expect(successToast.first()).toBeVisible({ timeout: 15_000 });
  });
});
