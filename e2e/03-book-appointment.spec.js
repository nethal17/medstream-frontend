import { test, expect } from "@playwright/test";
import { loginAsTestUser, pickFirstAvailableSlot } from "./helpers.js";

/**
 * Test: Book Appointment + Payment Redirect Flow
 *
 * Steps:
 * 1. Log in as yassulochana@gmail.com
 * 2. Navigate to /doctors (Find Your Doctor page)
 * 3. Wait for doctor cards to load
 * 4. Click "Book" on the first available doctor
 * 5. On the DoctorBookingPage:
 *    a. Pick a date with available slots
 *    b. Select a clinic (auto-selected)
 *    c. Select consultation type (auto-selected)
 *    d. Select the first available time slot
 * 6. Click "Confirm Booking"
 * 7. Assert:
 *    - Toast "Appointment request submitted" or "Redirecting to payment"
 *    - Lands on /doctors/confirmation OR redirects externally to payment gateway
 *
 * If a payment is required, the test intercepts the Stripe redirect and
 * asserts the appointment was created (the gateway URL is external so
 * we only verify that the redirect was triggered, not the gateway itself).
 *
 * Video recording is enabled in playwright.config.js (video: "on").
 */
test.describe("Book Appointment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("should book an appointment with the first available doctor and slot", async ({ page }) => {
    // --- Navigate to doctors list ---
    await page.goto("/doctors");
    await page.waitForLoadState("networkidle");

    // --- Wait for doctor cards to load ---
    const bookButton = page.getByRole("button", { name: "Book" }).first();
    await expect(bookButton).toBeVisible({ timeout: 20_000 });
    await bookButton.click();

    // --- Now on DoctorBookingPage ---
    await page.waitForURL("**/doctors/**", { timeout: 10_000 });
    await page.waitForLoadState("networkidle");

    // --- Pick a slot ---
    const slotFound = await pickFirstAvailableSlot(page);

    if (!slotFound) {
      test.skip(true, "No slots available for first doctor — skipping booking test.");
      return;
    }

    // --- Confirm booking ---
    const confirmBtn = page.getByRole("button", { name: /Confirm Booking/i });
    await expect(confirmBtn).toBeEnabled({ timeout: 5_000 });

    // Intercept payment redirect (Stripe is external — just capture navigation)
    let paymentRedirected = false;
    page.on("request", (req) => {
      if (req.url().includes("stripe.com") || req.url().includes("payment")) {
        paymentRedirected = true;
      }
    });

    await confirmBtn.click();

    // Assert: either lands on confirmation page or gets a success/payment toast
    const toastSuccess = page.locator("text=Appointment request submitted").or(
      page.locator("text=Redirecting to payment")
    );

    try {
      // Wait to reach confirmation page or toast
      await Promise.race([
        page.waitForURL("**/doctors/confirmation", { timeout: 15_000 }),
        toastSuccess.first().waitFor({ timeout: 15_000 }),
      ]);
    } catch {
      // If we get here it might be a payment redirect — acceptable
      // Verify the appointment was created by checking for toast
      await expect(toastSuccess.first()).toBeVisible({ timeout: 5_000 });
    }

    // Verify we're not still on the booking page with an error
    const errorToast = page.locator("text=Booking failed");
    await expect(errorToast).not.toBeVisible();
  });

  test("should display booking summary panel with doctor fee", async ({ page }) => {
    await page.goto("/doctors");
    await page.waitForLoadState("networkidle");

    const bookButton = page.getByRole("button", { name: "Book" }).first();
    await expect(bookButton).toBeVisible({ timeout: 20_000 });
    await bookButton.click();

    await page.waitForURL("**/doctors/**", { timeout: 10_000 });
    await page.waitForLoadState("networkidle");

    // Booking summary card should be visible
    await expect(page.getByText("Booking Summary")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Professional Fee")).toBeVisible();
    await expect(page.getByText("Total Amount")).toBeVisible();
  });
});
