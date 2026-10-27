/**
 * Visual regression: screenshot key pages and game states.
 * First run creates baselines. Subsequent runs diff against them.
 *
 *   npx playwright test tests/playwright/visual-regression.e2e.spec.ts
 *   npx playwright test tests/playwright/visual-regression.e2e.spec.ts --update-snapshots
 */

import { expect, test, type Page } from "@playwright/test";
import { blockThirdParty } from "./helpers/network";

test.beforeEach(async ({ page }) => {
  await blockThirdParty(page);
});

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
  {
    name: "custom-solutions-o-tether",
    path: "/services/custom-solutions/o-tether",
  },
];

type Theme = "light" | "dark";
const THEMES: Theme[] = ["dark", "light"];

/**
 * Force the site theme before any page script runs. The site reads
 * `localStorage.theme` and toggles the `.dark` class on <html> (it does not use
 * prefers-color-scheme), so we seed localStorage and also emulate the matching
 * color-scheme media so native form controls/scrollbars match.
 */
async function applyTheme(page: Page, theme: Theme) {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t);
    } catch {}
  }, theme);
  await page.emulateMedia({ colorScheme: theme });
}

async function stabilize(page: Page) {
  await page.addStyleTag({
    content: [
      "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;scroll-behavior:auto!important}",
      // Mock the Leaflet service-area map (network-blocked in beforeEach) with a
      // fixed-height box so async map init can't shift full-page screenshot
      // height between runs. The placeholder <img> injected below fills it.
      "[data-testid='service-area-map']{aspect-ratio:auto!important;height:420px!important;overflow:hidden}",
      "[data-testid='service-area-map'] > :not(img){visibility:hidden!important}",
      ".grecaptcha-badge{display:none!important}",
    ].join(""),
  });
  await page.evaluate(() => {
    for (const el of document.querySelectorAll(
      "[data-testid='service-area-map']",
    )) {
      const img = document.createElement("img");
      img.src = "/map-placeholder.svg";
      img.alt = "";
      img.style.cssText =
        "width:100%;height:100%;object-fit:cover;display:block";
      el.replaceChildren(img);
    }
  });
}

/**
 * Wait for the page to reach a stable layout before screenshotting: all images
 * finished loading, then full-page height unchanged across several animation
 * frames. Prevents flaky full-page snapshots where async content (images,
 * aspect-ratio media) settles after `networkidle` and shifts the page height.
 */
async function settle(page: Page) {
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
    await new Promise<void>((resolve) => {
      let lastHeight = -1;
      let stableFrames = 0;
      let totalFrames = 0;
      const tick = () => {
        const height = document.documentElement.scrollHeight;
        if (height === lastHeight) stableFrames += 1;
        else {
          stableFrames = 0;
          lastHeight = height;
        }
        totalFrames += 1;
        if (stableFrames >= 8 || totalFrames > 150) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
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
  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      for (const pg of SITE_PAGES) {
        test(`${pg.name} @ ${vp.name} (${theme})`, async ({ page }) => {
          await applyTheme(page, theme);
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(pg.path, { waitUntil: "networkidle" });
          await stabilize(page);
          await settle(page);
          await expect(page).toHaveScreenshot(
            `${pg.name}-${theme}-${vp.name}.png`,
            {
              fullPage: true,
              animations: "disabled",
            },
          );
        });
      }
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
      await expect(page).toHaveScreenshot(`dh-empty-${vp.name}.png`, {
        animations: "disabled",
      });
    });

    test(`onboarding @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ROUTE, { waitUntil: "networkidle" });
      await stabilize(page);
      await expect(
        page.getByRole("dialog", { name: "Build a safer home network" }),
      ).toBeVisible();
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
      for (const [index, [dev, room]] of placements.entries()) {
        await page.getByTestId("dh-device-" + dev).press("Enter");
        await page.getByTestId("dh-room-" + room).press("Enter");
        await expect(page.getByTestId("dh-score-hud")).toContainText(
          `${index + 1}/10`,
        );
      }

      await expect(page.getByTestId("dh-analysis-card")).not.toContainText(
        "Drag a device to a room to begin",
      );
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
      for (const [index, [dev, room]] of all.entries()) {
        await page.getByTestId("dh-device-" + dev).press("Enter");
        await page.getByTestId("dh-room-" + room).press("Enter");
        await expect(page.getByTestId("dh-score-hud")).toContainText(
          `${index + 1}/10`,
        );
      }

      const aarBtn = page.getByRole("button", { name: /results/i });
      await aarBtn.scrollIntoViewIfNeeded();
      await aarBtn.click();
      await expect(page.getByLabel(/after-action report/i)).toBeVisible();

      await expect(page).toHaveScreenshot(`dh-after-action-${vp.name}.png`, {
        animations: "disabled",
      });
    });
  }
});
