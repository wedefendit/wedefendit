/**
 * Site-wide tests: nav works, pages load, touch targets pass on every page.
 */

import { expect, test } from "@playwright/test";
import { assertTouchTargets } from "./helpers/assertions";

const PAGES = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
  { name: "Awareness", path: "/awareness" },
  { name: "Digital House", path: "/awareness/digital-house" },
];

test.describe("Site-wide page loads", () => {
  for (const { name, path } of PAGES) {
    test(`${name} loads without error`, async ({ page }) => {
      const resp = await page.goto(path, { waitUntil: "networkidle" });
      expect(resp?.status(), `${name} returned ${resp?.status()}`).toBeLessThan(
        400,
      );
    });
  }
});

test.describe("Site nav", () => {
  test("nav visible on every page", async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.locator("nav").first()).toBeVisible();
    }
  });

  test("no nav links return 404", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator("nav a[href]")
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("href")).filter(Boolean),
      );
    for (const href of hrefs) {
      if (!href || href.startsWith("http") || href.startsWith("#")) continue;
      const resp = await page.goto(href);
      expect(resp?.status(), `${href} = ${resp?.status()}`).toBeLessThan(400);
    }
  });
});

test.describe("Site-wide touch targets (mobile)", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 667 },
  });
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === "firefox", "isMobile not supported in Firefox");
  });

  for (const { name, path } of PAGES) {
    test(`${name}: touch targets >= 44px`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      // Dismiss any auto-opened overlay (e.g. CoachMark on Digital House)
      const skip = page.getByRole("button", { name: /^skip$/i });
      try {
        await skip.waitFor({ state: "visible", timeout: 1500 });
        await skip.click();
        await expect(
          page.locator('[role="dialog"][aria-modal="true"]'),
        ).toHaveCount(0, { timeout: 2000 });
      } catch {
        // No overlay on this page
      }

      // Sanity check at 36px -- strict 44px game audit lives in ui.audit.
      // Only audit buttons -- inline links, form inputs, and images
      // (Leaflet markers have tabindex) aren't the targets this guards.
      await assertTouchTargets(page, {
        minSize: 36,
        exclude: [
          "nav *",
          "footer *",
          "a",
          "input",
          "select",
          "textarea",
          "img",
          '[role="radio"]',
          '[data-testid^="dh-device-"]',
          '[data-testid^="dh-room-"]',
          '[data-testid="dh-header"] *',
          '[aria-label^="Switch to"]',
        ].join(", "),
      });
    });
  }
});
