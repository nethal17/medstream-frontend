/**
 * Shared test helpers for MedStream E2E tests.
 * Contains login/logout helpers and common wait patterns.
 */

export const BASE_URL = "http://localhost:5173";

export const TEST_USER = {
  email: "yassulochana@gmail.com",
  password: "admin123",
  fullName: "Yas Sulochana",
};

// A unique email for the registration test to avoid 409 conflicts.
// Playwright stamps the run time in to keep it unique per run.
export const NEW_USER = {
  fullName: "Test Patient",
  email: `testpatient+${Date.now()}@mailinator.com`,
  phone: "0771234567",
  password: "Test@1234",
};

/**
 * Log in the TEST_USER through the UI.
 * Assumes the browser is already at any page on BASE_URL.
 */
export async function loginAsTestUser(page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Email").fill(TEST_USER.email);
  await page.getByLabel("Password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait until we land somewhere other than /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });
}

/**
 * Pick the first available date slot from the date input on the booking page.
 * Iterates forward by one day until the slots section is non-empty.
 */
export async function pickFirstAvailableSlot(page) {
  // Try up to 7 days ahead to find an open slot
  for (let attempt = 0; attempt < 7; attempt++) {
    const slotsText = await page.locator("text=No slots available").count();
    if (slotsText === 0) {
      // Check there are actual slot buttons rendered
      const slotButtons = page.locator("section button").filter({ hasText: /AM|PM/ });
      const count = await slotButtons.count();
      if (count > 0) {
        await slotButtons.first().click();
        return true;
      }
    }

    // Advance date by one day
    const dateInput = page.locator('input[type="date"]').first();
    const current = await dateInput.inputValue();
    const next = new Date(current);
    next.setDate(next.getDate() + 1);
    await dateInput.fill(next.toISOString().slice(0, 10));
    await page.waitForTimeout(1500); // let slots refresh
  }
  return false;
}
