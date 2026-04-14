/**
 * Visual regression: screenshot key pages and game states.
 * First run creates baselines. Subsequent runs diff against them.
 *
 *   npx playwright test tests/playwright/visual-regression.e2e.spec.ts
 *   npx playwright test tests/playwright/visual-regression.e2e.spec.ts --update-snapshots
 */

import { expect, test, type Page } from "@playwright/test";

const ROUTE = "/awareness/digital-house";

const VIEWPORTS = [
  { name: "iphone-se", width: 375, height: 667, mobile: true },
  { name: "iphone-14", width: 390, height: 844, mobile: true },
  { name: "pixel-5", width: 393, height: 852, mobile: true },
  { name: "ipad", width: 820, height: 1180, mobile: false },
  { name: "laptop", width: 1366, height: 768, mobile: false },
  { name: "desktop", width: 1920, height: 1080, mobile: false },
];

const SITE_PAGES = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "services", path: "/services" },
  { name: "contact", path: "/contact" },
  { name: "awareness", path: "/awareness" },
];

async function stabilize(page: Page) {
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;scroll-behavior:auto!important}",
  });
}

/**
 * Dismiss the CoachMark onboarding that auto-opens on first visit.
 */
async function dismissOnboarding(page: Page) {
  // CoachMark auto-opens after 400ms. Click Skip (more reliable than Escape across browsers).
  const skip = page.getByRole("button", { name: /^skip$/i });
  try {
    await skip.waitFor({ state: "visible", timeout: 2000 });
    await skip.click();
  } catch {
    // CoachMark didn't appear (don't-show-again was set) -- try Escape as fallback
    await page.keyboard.press("Escape");
  }
  // Wait until no modal dialog remains
  await expect(page.locator('[role="dialog"][aria-modal="true"]')).toHaveCount(
    0,
    { timeout: 3000 },
  );
}

// ====== SITE PAGES ======

test.describe("Visual: site pages", () => {
  for (const vp of VIEWPORTS) {
    for (const pg of SITE_PAGES) {
      test(`${pg.name} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(pg.path, { waitUntil: "networkidle" });
        await stabilize(page);
        await page.waitForTimeout(300);
        await expect(page).toHaveScreenshot(`${pg.name}-${vp.name}.png`, {
          fullPage: true,
          animations: "disabled",
        });
      });
    }
  }
});

// ====== DIGITAL HOUSE STATES ======

test.describe("Visual: Digital House", () => {
  for (const vp of VIEWPORTS) {
    test(`empty board @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      await dismissOnboarding(page);
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`dh-empty-${vp.name}.png`, {
        animations: "disabled",
      });
    });

    test(`onboarding @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      // CoachMark onboarding auto-opens after 400ms
      await page.waitForTimeout(600);
      await expect(page).toHaveScreenshot(`dh-onboarding-${vp.name}.png`, {
        animations: "disabled",
      });
    });

    test(`help modal @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      await dismissOnboarding(page);
      // Open help modal via button
      await page.getByRole("button", { name: /how to play/i }).click();
      await expect(page.getByTestId("dh-help-modal")).toBeVisible();
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`dh-help-modal-${vp.name}.png`, {
        animations: "disabled",
      });
    });

    test(`mid-game @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      await dismissOnboarding(page);

      // Place 3 devices
      const placements = [
        ["work-laptop", "office"],
        ["personal-phone", "bedroom"],
        ["smart-tv", "living-room"],
      ];
      for (const [dev, room] of placements) {
        await page.getByTestId("dh-device-" + dev).click();
        await page.getByTestId("dh-room-" + room).click();
        await page.waitForTimeout(100);
      }

      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`dh-mid-game-${vp.name}.png`, {
        animations: "disabled",
      });
    });

    test(`after-action report @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      await dismissOnboarding(page);

      // Place all 10
      const all = [
        ["work-laptop", "office"],
        ["personal-phone", "bedroom"],
        ["tablet", "bedroom"],
        ["guest-phone", "entry-exterior"],
        ["printer", "kitchen"],
        ["smart-tv", "living-room"],
        ["smart-speaker", "living-room"],
        ["game-console", "living-room"],
        ["doorbell-camera", "entry-exterior"],
        ["camera-hub", "kitchen"],
      ];
      for (const [dev, room] of all) {
        await page.getByTestId("dh-device-" + dev).click();
        await page.getByTestId("dh-room-" + room).click();
        await page.waitForTimeout(80);
      }

      const aarBtn = page.getByRole("button", { name: /after-action/i });
      await aarBtn.scrollIntoViewIfNeeded();
      await aarBtn.click();
      await expect(page.getByLabel(/after-action report/i)).toBeVisible();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot(`dh-after-action-${vp.name}.png`, {
        animations: "disabled",
      });
    });
  }
});
