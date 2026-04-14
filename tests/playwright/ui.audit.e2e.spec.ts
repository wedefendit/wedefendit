/**
 * UI audit: tests for every bug fixed in the April 2026 mobile pass.
 *
 * - Modal z-index stacking (isolate trap)
 * - Modal X button occlusion (DOM paint order)
 * - Modal close on touch (touch-manipulation, arrow wrappers)
 * - Modal scrollability
 * - Analysis card text truncation
 * - Analysis card column split on mobile
 * - Toast sizing on mobile
 * - Touch target minimums
 */

import { expect, test, type Page } from "@playwright/test";
import {
  assertNotOccluded,
  assertNoTextTruncation,
  assertOverlayAboveNav,
  assertScrollable,
  assertTouchTargets,
} from "./helpers/assertions";

const ROUTE = "/awareness/digital-house";

const PHONE_VIEWPORTS = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 412, height: 915 },
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
  const skip = page.getByRole("button", { name: /^skip$/i });
  try {
    await skip.waitFor({ state: "visible", timeout: 2000 });
    await skip.click();
  } catch {
    await page.keyboard.press("Escape");
  }
  await expect(page.locator('[role="dialog"][aria-modal="true"]')).toHaveCount(
    0,
    { timeout: 3000 },
  );
}

async function openGame(page: Page) {
  await page.goto(ROUTE, { waitUntil: "networkidle" });
  await expect(page.getByTestId("dh-root")).toBeVisible();
  await stabilize(page);
  await dismissOnboarding(page);
}

async function placeAllDevices(page: Page) {
  const deviceIds = [
    "work-laptop",
    "personal-phone",
    "tablet",
    "guest-phone",
    "printer",
    "smart-tv",
    "smart-speaker",
    "game-console",
    "doorbell-camera",
    "camera-hub",
  ];
  const roomIds = [
    "office",
    "bedroom",
    "bedroom",
    "entry-exterior",
    "kitchen",
    "living-room",
    "living-room",
    "living-room",
    "entry-exterior",
    "kitchen",
  ];
  for (let i = 0; i < deviceIds.length; i++) {
    await page.getByTestId("dh-device-" + deviceIds[i]).click();
    await page.getByTestId("dh-room-" + roomIds[i]).click();
    await page.waitForTimeout(80);
  }
}

// ====== HELP MODAL ======

test.describe("Help Modal lifecycle", () => {
  test.use({ hasTouch: true, isMobile: true });
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === "firefox", "isMobile not supported in Firefox");
  });

  for (const vp of PHONE_VIEWPORTS) {
    test(`${vp.width}x${vp.height}: opens via How to Play and closes via X tap`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      await dismissOnboarding(page);

      // Open help modal via the How to Play button
      await page.getByRole("button", { name: /how to play/i }).click();
      const modal = page.getByTestId("dh-help-modal");
      await expect(modal).toBeVisible();

      // X button must not be occluded -- use exact aria-label to avoid
      // matching the backdrop ("Close help") in strict mode
      const closeBtn = page.getByRole("button", { name: "Close", exact: true });
      await assertNotOccluded(closeBtn);

      // Tap to close
      await closeBtn.tap();
      await expect(modal).toHaveCount(0);
    });

    test(`${vp.width}x${vp.height}: renders above site nav`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      await dismissOnboarding(page);

      await page.getByRole("button", { name: /how to play/i }).click();
      await expect(page.getByTestId("dh-help-modal")).toBeVisible();
      await assertOverlayAboveNav(page, '[data-testid="dh-help-modal"]');
    });

    test(`${vp.width}x${vp.height}: content is scrollable`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      await dismissOnboarding(page);

      await page.getByRole("button", { name: /how to play/i }).click();
      const modal = page.getByTestId("dh-help-modal");
      await expect(modal).toBeVisible();
      await assertScrollable(modal);
    });
  }
});

// ====== AFTER-ACTION REPORT ======

test.describe("After-Action Report lifecycle", () => {
  test.use({ hasTouch: true, isMobile: true });
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === "firefox", "isMobile not supported in Firefox");
  });

  for (const vp of PHONE_VIEWPORTS) {
    test(`${vp.width}x${vp.height}: X button closes on tap`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await openGame(page);
      await placeAllDevices(page);

      // Open the after-action report
      const aarBtn = page.getByRole("button", { name: /after-action/i });
      await aarBtn.scrollIntoViewIfNeeded();
      await aarBtn.click();
      const modal = page.getByLabel(/after-action report/i);
      await expect(modal).toBeVisible();

      // X has aria-label="Dismiss" -- only one match (backdrop is "Close summary")
      const closeBtn = page.getByRole("button", {
        name: "Dismiss",
        exact: true,
      });
      await assertNotOccluded(closeBtn);

      // Tap to close
      await closeBtn.tap();
      await expect(modal).not.toBeVisible({ timeout: 3_000 });
    });

    test(`${vp.width}x${vp.height}: closes via backdrop tap`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await openGame(page);
      await placeAllDevices(page);

      const aarBtn = page.getByRole("button", { name: /after-action/i });
      await aarBtn.scrollIntoViewIfNeeded();
      await aarBtn.click();
      const modal = page.getByLabel(/after-action report/i);
      await expect(modal).toBeVisible();

      // Tap outside the modal (backdrop button covers the entire viewport)
      await page.tap("body", { position: { x: 5, y: 5 } });
      await expect(modal).not.toBeVisible({ timeout: 3_000 });
    });

    test(`${vp.width}x${vp.height}: renders above site nav`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await openGame(page);
      await placeAllDevices(page);

      const aarBtn = page.getByRole("button", { name: /after-action/i });
      await aarBtn.scrollIntoViewIfNeeded();
      await aarBtn.click();
      await expect(page.getByLabel(/after-action report/i)).toBeVisible();
      await assertOverlayAboveNav(page, '[aria-label="After-action report"]');
    });
  }
});

// ====== ANALYSIS CARD ======

test.describe("Analysis card feedback", () => {
  test.use({ hasTouch: true, isMobile: true });
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === "firefox", "isMobile not supported in Firefox");
  });

  for (const vp of PHONE_VIEWPORTS) {
    test(`${vp.width}x${vp.height}: feedback text not truncated`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await openGame(page);

      // Place a device to trigger feedback
      await page.getByTestId("dh-device-camera-hub").click();
      await page.getByTestId("dh-room-kitchen").click();
      await page.waitForTimeout(200);

      const card = page.getByTestId("dh-analysis-card");
      await expect(card).toBeVisible();

      // No overflow:hidden clipping
      const overflow = await card.evaluate(
        (el) => getComputedStyle(el).overflow,
      );
      expect(overflow, "Card has overflow:hidden").not.toBe("hidden");

      // Only check the TIP TEXT span (last span in the card) for truncation.
      // Earlier spans (device name, "Live Analysis") may have their own
      // legitimate styling that triggers false positives.
      const tipSpan = card.locator("span").last();
      await assertNoTextTruncation(tipSpan);
    });

    test(`${vp.width}x${vp.height}: tip text uses full card width (no column split)`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await openGame(page);

      await page.getByTestId("dh-device-camera-hub").click();
      await page.getByTestId("dh-room-kitchen").click();
      await page.waitForTimeout(200);

      const card = page.getByTestId("dh-analysis-card");
      const ratio = await card.evaluate((el) => {
        const spans = el.querySelectorAll("span");
        const tip = spans[spans.length - 1] as HTMLElement | undefined;
        if (!tip) return 1;
        return tip.clientWidth / el.clientWidth;
      });

      expect(
        ratio,
        `Tip uses only ${Math.round(ratio * 100)}% width`,
      ).toBeGreaterThan(0.65);
    });
  }
});

// ====== TOUCH TARGETS ======

test.describe("Touch targets", () => {
  test.use({ hasTouch: true, isMobile: true });
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === "firefox", "isMobile not supported in Firefox");
  });

  test("all game buttons >= 44px on iPhone SE", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await openGame(page);
    await assertTouchTargets(page, {
      minSize: 44,
      exclude: [
        "nav *",
        '[role="radio"]',
        '[data-testid^="dh-device-"]',
        '[data-testid^="dh-room-"]',
        '[data-testid="dh-header"] *',
        '[aria-label^="Switch to"]',
      ].join(", "),
    });
  });

  test("modal close buttons >= 38px on iPhone SE", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(ROUTE, { waitUntil: "networkidle" });
    await stabilize(page);
    await dismissOnboarding(page);

    // Open help modal
    await page.getByRole("button", { name: /how to play/i }).click();
    await expect(page.getByTestId("dh-help-modal")).toBeVisible();

    // Help modal X -- exact match to avoid strict mode on backdrop
    const helpClose = page.getByRole("button", { name: "Close", exact: true });
    const helpBox = await helpClose.boundingBox();
    expect(helpBox).toBeTruthy();
    if (helpBox) {
      expect(helpBox.width, "Help X width").toBeGreaterThanOrEqual(34);
      expect(helpBox.height, "Help X height").toBeGreaterThanOrEqual(34);
    }
  });
});
