// @ts-expect-error node works
import fs from "node:fs";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const ROUTE = "/awareness/digital-house";

enum DifficultyValue {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

type Difficulty = `${DifficultyValue}`;
type Viewport = Readonly<{ width: number; height: number }>;

const DESKTOP_DIFFICULTIES: ReadonlyArray<Difficulty> = [
  DifficultyValue.Easy,
  DifficultyValue.Medium,
];

const PHONE_VIEWPORTS = [
  { width: 275, height: 600 },
  { width: 320, height: 828 },
  { width: 360, height: 640 },
  { width: 360, height: 800 }, // Samsung Galaxy A51/71
  { width: 375, height: 667 }, // iPhone SE
  { width: 390, height: 844 }, // iPhone 12 Pro
  { width: 393, height: 852 }, // Pixel 7
  { width: 412, height: 915 }, // Samsung Galaxy S20 Ultra
  { width: 414, height: 896 }, // iPhone XR
  { width: 428, height: 926 }, // iPhone 14 Pro Max
  { width: 540, height: 720 }, // Surface Duo
  { width: 344, height: 882 }, // Galaxy Z Fold 5 (folded)
  { width: 763, height: 768 },
  { width: 768, height: 1024 }, // iPad Mini
];
const DESKTOP_VIEWPORTS = [
  { width: 820, height: 768 },
  { width: 820, height: 1180 }, // iPad Air
  { width: 912, height: 1368 },
  { width: 998, height: 1130 },
  { width: 1022, height: 768 },
  { width: 1024, height: 1366 }, // iPad Pro
  { width: 1114, height: 834 }, // Surface Pro 7
  { width: 1280, height: 800 }, // Asus Zenbook Fold / Nest Hub Max
  { width: 1366, height: 768 },
  { width: 1024, height: 600 }, // Nest Hub
  { width: 1920, height: 1080 },
];
type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
  position: string;
} | null;

type Metrics = {
  documentScrollWidth: number;
  documentScrollHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  header: Box;
  house: Box;
  rail: Box;
  score: Box;
  analysis: Box;
  inventory: Box;
  deviceStrip: Box;
  zoneExterior: Box;
};

/**
 * Determine layout mode using the same logic as the controller:
 *   mobile = width < 820 || height < 500
 *   tablet = !mobile && width < 1100 && height > width
 *   desktop = everything else
 */
function layoutMode(vp: {
  width: number;
  height: number;
}): "mobile" | "tablet" | "desktop" {
  const mobile = vp.width < 820 || vp.height < 500;
  if (mobile) return "mobile";
  if (vp.width < 1100 && vp.height > vp.width) return "tablet";
  return "desktop";
}

async function stabilize(page: Page) {
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;scroll-behavior:auto!important}",
  });
}

/**
 * Navigate to the game, dismiss the CoachMark onboarding (Escape),
 * select a difficulty, and wait for the house panel.
 */
async function openGame(page: Page, difficulty: Difficulty) {
  await page.goto(ROUTE, { waitUntil: "networkidle" });
  await expect(page.getByTestId("dh-root")).toBeVisible();
  await stabilize(page);

  // CoachMark onboarding auto-opens. Click Skip (reliable across browsers).
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

  const difficultyPattern =
    difficulty === "medium" ? /med(ium)?/i : new RegExp(difficulty, "i");
  await page.getByRole("radio", { name: difficultyPattern }).click();
  await expect(page.getByTestId("dh-house-panel")).toBeVisible();
}

async function attachScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
  options: { fullPage?: boolean } = {},
) {
  const path = testInfo.outputPath(name + ".png");
  await page.screenshot({ path, fullPage: options.fullPage ?? false });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function collectMetrics(page: Page): Promise<Metrics> {
  return page.evaluate(() => {
    const getBox = (selector: string) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        scrollHeight: el.scrollHeight,
        position: getComputedStyle(el).position,
      };
    };
    return {
      documentScrollWidth:
        document.scrollingElement?.scrollWidth ?? document.body.scrollWidth,
      documentScrollHeight:
        document.scrollingElement?.scrollHeight ?? document.body.scrollHeight,
      header: getBox('[data-testid="dh-header"]'),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      house: getBox('[data-testid="dh-house-panel"]'),
      rail: getBox('[data-testid="dh-rail"]'),
      score: getBox('[data-testid="dh-score-hud"]'),
      analysis: getBox('[data-testid="dh-analysis-card"]'),
      inventory: getBox('[data-testid="dh-inventory-panel"]'),
      deviceStrip: getBox('[data-testid="dh-device-strip"]'),
      zoneExterior: getBox('[data-testid="dh-room-zone-entry-exterior"]'),
    };
  });
}

async function attachMetrics(
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<Metrics> {
  const metrics = await collectMetrics(page);
  const path = testInfo.outputPath(name + ".json");
  fs.writeFileSync(path, JSON.stringify(metrics, null, 2));
  await testInfo.attach(name, { path, contentType: "application/json" });
  return metrics;
}

async function deviceLabelFits(page: Page, deviceId: string) {
  return page.getByTestId("dh-device-" + deviceId).evaluate((el) => {
    const labels = Array.from(el.querySelectorAll("span"));
    const label = labels[labels.length - 1] as HTMLElement | undefined;
    if (!label) return false;
    return (
      label.clientWidth >= 28 && label.scrollWidth <= label.clientWidth + 1
    );
  });
}

async function roomHasDevice(page: Page, roomId: string, title: string) {
  return page
    .getByTestId("dh-room-" + roomId)
    .locator("button[title]")
    .evaluateAll(
      (els, wanted) =>
        els.filter(
          (el) =>
            (el.getAttribute("title") ?? "").toLowerCase() ===
            (wanted as string).toLowerCase(),
        ).length,
      title,
    );
}

async function placeDevice(page: Page, deviceId: string, roomId: string) {
  await page.getByTestId("dh-device-" + deviceId).press("Enter");
  await page.getByTestId("dh-room-" + roomId).press("Enter");
}

async function assignRoomZone(page: Page, roomId: string, zoneId: string) {
  await page.getByTestId("dh-room-zone-" + roomId).click();
  await expect(
    page.getByTestId("dh-room-zone-popover-" + roomId),
  ).toBeVisible();
  await page
    .getByTestId("dh-room-zone-option-" + roomId + "-" + zoneId)
    .click();
  await expect(page.getByTestId("dh-room-zone-popover-" + roomId)).toHaveCount(
    0,
  );
}

function assertCommonMetrics(metrics: Metrics) {
  expect(metrics.header).not.toBeNull();
  expect(metrics.house).not.toBeNull();
  expect(metrics.score).not.toBeNull();
  expect(metrics.analysis).not.toBeNull();
}

function assertDesktopRailMetrics(metrics: Metrics) {
  if (
    !metrics.header ||
    !metrics.house ||
    !metrics.rail ||
    !metrics.score ||
    !metrics.analysis ||
    !metrics.inventory
  ) {
    return;
  }
  expect(metrics.house.y).toBeGreaterThanOrEqual(metrics.header.bottom - 2);
  expect(metrics.rail.y).toBeGreaterThanOrEqual(metrics.header.bottom - 2);
  expect(metrics.house.right).toBeLessThanOrEqual(metrics.rail.x + 8);
  expect(metrics.house.width).toBeGreaterThan(metrics.rail.width - 20);
  expect(metrics.score.x).toBeGreaterThanOrEqual(metrics.rail.x - 2);
  expect(metrics.analysis.x).toBeGreaterThanOrEqual(metrics.rail.x - 2);
  expect(metrics.inventory.x).toBeGreaterThanOrEqual(metrics.rail.x - 2);
  expect(metrics.analysis.y).toBeGreaterThanOrEqual(metrics.score.bottom - 4);
  expect(metrics.inventory.y).toBeGreaterThanOrEqual(
    metrics.analysis.bottom - 4,
  );
  expect(metrics.score.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.analysis.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.inventory.right).toBeLessThanOrEqual(
    metrics.viewportWidth + 1,
  );
  expect(metrics.rail.bottom).toBeLessThanOrEqual(metrics.viewportHeight + 4);
  expect(metrics.inventory.height).toBeLessThan(
    metrics.inventory.scrollHeight * 2 + 40,
  );
}

async function assertDesktopMode(page: Page, metrics: Metrics) {
  expect(metrics.rail).not.toBeNull();
  expect(metrics.inventory).not.toBeNull();
  await expect(page.getByTestId("dh-inventory-panel")).toBeVisible();
  assertDesktopRailMetrics(metrics);
}

async function assertTabletMode(page: Page, metrics: Metrics) {
  expect(metrics.rail).toBeNull();
  expect(metrics.inventory).not.toBeNull();
  await expect(page.getByTestId("dh-inventory-panel")).toBeVisible();
  if (!metrics.header || !metrics.score || !metrics.analysis) return;
  expect(metrics.score.y).toBeGreaterThanOrEqual(metrics.header.bottom - 2);
  expect(metrics.analysis.y).toBeGreaterThanOrEqual(metrics.score.bottom - 4);
  expect(metrics.score.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.analysis.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
}

async function assertZoneControls(
  page: Page,
  viewport: Viewport,
  difficulty: Difficulty,
) {
  if (difficulty !== DifficultyValue.Medium) return;
  if (viewport.width >= 1280) {
    await expect(page.getByRole("button", { name: /room zones/i })).toHaveCount(
      0,
    );
  } else {
    expect(await deviceLabelFits(page, "work-laptop")).toBeTruthy();
    expect(await deviceLabelFits(page, "guest-phone")).toBeTruthy();
    expect(await deviceLabelFits(page, "doorbell-camera")).toBeTruthy();
  }
  await expect(page.getByTestId("dh-room-zone-bedroom")).toBeVisible();
  await expect(page.getByTestId("dh-room-zone-entry-exterior")).toBeVisible();
}

async function auditDesktopViewport(
  page: Page,
  testInfo: TestInfo,
  viewport: Viewport,
  difficulty: Difficulty,
) {
  await page.setViewportSize(viewport);
  await openGame(page, difficulty);
  const baseName = `desktop-${difficulty}-${viewport.width}x${viewport.height}`;
  await attachScreenshot(page, testInfo, baseName);
  const metrics = await attachMetrics(page, testInfo, baseName + "-metrics");
  assertCommonMetrics(metrics);
  if (layoutMode(viewport) === "desktop") {
    await assertDesktopMode(page, metrics);
  } else {
    await assertTabletMode(page, metrics);
  }
  await assertZoneControls(page, viewport, difficulty);
  return metrics;
}

function assertPhoneMetrics(metrics: Metrics) {
  expect(metrics.score).not.toBeNull();
  expect(metrics.house).not.toBeNull();
  expect(metrics.deviceStrip).not.toBeNull();
  expect(metrics.analysis).not.toBeNull();
  if (
    !metrics.score ||
    !metrics.house ||
    !metrics.header ||
    !metrics.deviceStrip ||
    !metrics.analysis
  ) {
    return;
  }
  expect(metrics.score.y).toBeGreaterThanOrEqual(metrics.header.bottom - 2);
  expect(metrics.score.bottom).toBeLessThanOrEqual(metrics.house.y + 10);
  expect(metrics.house.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.score.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.analysis.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.deviceStrip.right).toBeLessThanOrEqual(
    metrics.viewportWidth + 1,
  );
  expect(metrics.deviceStrip.y).toBeGreaterThanOrEqual(metrics.house.y - 2);
}

async function assertPhoneScroll(page: Page) {
  const canScroll = await page.evaluate(() => {
    const scrollHeight =
      document.scrollingElement?.scrollHeight ?? document.body.scrollHeight;
    return scrollHeight > window.innerHeight + 4;
  });
  const startScroll = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  if (canScroll) {
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(startScroll);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

async function exercisePhonePlacement(page: Page) {
  await page.getByTestId("dh-room-zone-bedroom").click();
  await expect(page.getByTestId("dh-room-zone-popover-bedroom")).toBeVisible();
  await page.getByTestId("dh-room-zone-option-bedroom-main").click();
  await expect(page.getByTestId("dh-room-zone-popover-bedroom")).toHaveCount(0);
  await page.getByTestId("dh-device-personal-phone").click();
  await page.getByTestId("dh-room-bedroom").click();
  await expect(page.getByTestId("dh-analysis-card")).not.toContainText(
    "Drag a device to a room to begin",
  );
  expect(await roomHasDevice(page, "bedroom", "Personal phone")).toBe(1);
  await page.getByTestId("dh-device-personal-phone").click();
  await page.getByTestId("dh-device-personal-phone").click();
  await page.getByTestId("dh-room-office").click();
  expect(await roomHasDevice(page, "bedroom", "Personal phone")).toBe(0);
  expect(await roomHasDevice(page, "office", "Personal phone")).toBe(1);
}

async function auditPhoneViewport(
  page: Page,
  testInfo: TestInfo,
  viewport: Viewport,
) {
  await page.setViewportSize(viewport);
  await openGame(page, DifficultyValue.Medium);
  const baseName = `phone-medium-${viewport.width}x${viewport.height}`;
  await attachScreenshot(page, testInfo, baseName);
  const metrics = await attachMetrics(page, testInfo, baseName + "-metrics");
  assertPhoneMetrics(metrics);
  await assertPhoneScroll(page);
  await exercisePhonePlacement(page);
  return metrics;
}

test.describe("Digital House desktop audit", () => {
  test.use({ hasTouch: false, isMobile: false });

  for (const viewport of DESKTOP_VIEWPORTS) {
    for (const difficulty of DESKTOP_DIFFICULTIES) {
      test(`desktop ${difficulty} ${viewport.width}x${viewport.height}`, async ({
        page,
      }, testInfo) => {
        const metrics = await auditDesktopViewport(
          page,
          testInfo,
          viewport,
          difficulty,
        );
        expect(metrics.documentScrollWidth).toBeLessThanOrEqual(
          metrics.viewportWidth + 1,
        );
      });
    }
  }

  test("help modal opens via How to Play and dont-show-again suppresses future auto-open", async ({
    page,
  }, testInfo) => {
    const viewport = { width: 390, height: 844 };
    await page.setViewportSize(viewport);
    await page.goto(ROUTE, { waitUntil: "networkidle" });
    await stabilize(page);

    // Dismiss CoachMark first
    const skip1 = page.getByRole("button", { name: /^skip$/i });
    try {
      await skip1.waitFor({ state: "visible", timeout: 2000 });
      await skip1.click();
    } catch {
      await page.keyboard.press("Escape");
    }
    await expect(
      page.locator('[role="dialog"][aria-modal="true"]'),
    ).toHaveCount(0, { timeout: 3000 });

    // Open help modal via button
    await page.getByRole("button", { name: /how to play/i }).click();
    const helpModal = page.getByTestId("dh-help-modal");
    await expect(helpModal).toBeVisible();

    await page.getByRole("checkbox", { name: /don't show again/i }).check();
    await helpModal.getByLabel("Close", { exact: true }).click();
    await expect(helpModal).toHaveCount(0);

    // Reload: CoachMark should be suppressed by the preference
    await page.reload({ waitUntil: "networkidle" });
    await stabilize(page);
    // The onboarding pref key is shared, so neither coach nor help opens
    await expect(page.getByTestId("dh-help-modal")).toHaveCount(0);

    await attachScreenshot(page, testInfo, "help-modal-dont-show-again");
  });

  test("desktop drag between rooms still works", async ({ page }, testInfo) => {
    const viewport = { width: 1366, height: 768 };
    await page.setViewportSize(viewport);
    await openGame(page, "easy");

    await page
      .getByTestId("dh-device-work-laptop")
      .dragTo(page.getByTestId("dh-room-office"));
    await expect(page.getByTestId("dh-analysis-card")).not.toContainText(
      "Drag a device to a room to begin",
    );

    const officeChip = page
      .getByTestId("dh-room-office")
      .getByRole("button", { name: /^work laptop/i });
    await officeChip.dragTo(page.getByTestId("dh-room-kitchen"));

    expect(await roomHasDevice(page, "office", "Work laptop")).toBe(0);
    expect(await roomHasDevice(page, "kitchen", "Work laptop")).toBe(1);

    await attachScreenshot(page, testInfo, "desktop-drag-between-rooms");
    await attachMetrics(page, testInfo, "desktop-drag-between-rooms-metrics");
  });
});

test.describe("Digital House phone audit", () => {
  test.use({ hasTouch: true, isMobile: true });
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === "firefox", "isMobile not supported in Firefox"); // NOSONAR
  });

  for (const viewport of PHONE_VIEWPORTS) {
    test(`phone medium ${viewport.width}x${viewport.height}`, async ({
      page,
    }, testInfo) => {
      const metrics = await auditPhoneViewport(page, testInfo, viewport);
      expect(metrics.documentScrollWidth).toBeLessThanOrEqual(
        metrics.viewportWidth + 1,
      );
    });
  }

  test("help modal opens via How to Play and dismisses with touch tap on phone", async ({
    page,
  }, testInfo) => {
    const viewport = { width: 390, height: 844 };
    await page.setViewportSize(viewport);
    await page.goto(ROUTE, { waitUntil: "networkidle" });
    await stabilize(page);

    // Dismiss CoachMark
    const skipBtn = page.getByRole("button", { name: /^skip$/i });
    try {
      await skipBtn.waitFor({ state: "visible", timeout: 2000 });
      await skipBtn.click();
    } catch {
      await page.keyboard.press("Escape");
    }
    await expect(
      page.locator('[role="dialog"][aria-modal="true"]'),
    ).toHaveCount(0, { timeout: 3000 });

    // Open help modal
    await page.getByRole("button", { name: /how to play/i }).click();
    const helpModal = page.getByTestId("dh-help-modal");
    await expect(helpModal).toBeVisible();
    await helpModal.getByLabel("Close", { exact: true }).tap();
    await expect(helpModal).toHaveCount(0);

    await attachScreenshot(page, testInfo, "help-modal-touch-dismiss");
  });

  test("theme toggle updates Digital House chrome", async ({
    page,
  }, testInfo) => {
    const viewport = { width: 390, height: 844 };
    await page.setViewportSize(viewport);
    await openGame(page, "medium");

    await page.getByRole("button", { name: /how to play/i }).click();
    const helpModal = page.getByTestId("dh-help-modal");
    await expect(helpModal).toBeVisible();
    const helpBefore = await helpModal.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    await page.keyboard.press("Escape");

    const scoreBefore = await page
      .getByTestId("dh-score-hud")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const stripBefore = await page
      .getByTestId("dh-device-strip")
      .evaluate((el) => getComputedStyle(el).color);

    await page.getByRole("button", { name: /switch to light mode/i }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    const scoreAfter = await page
      .getByTestId("dh-score-hud")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const stripAfter = await page
      .getByTestId("dh-device-strip")
      .evaluate((el) => getComputedStyle(el).color);

    await page.getByRole("button", { name: /how to play/i }).click();
    const helpAfter = await page
      .getByTestId("dh-help-modal")
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(scoreAfter).not.toBe(scoreBefore);
    expect(stripAfter).not.toBe(stripBefore);
    expect(helpAfter).not.toBe(helpBefore);

    await attachScreenshot(page, testInfo, "theme-light-mobile");
    await attachMetrics(page, testInfo, "theme-light-mobile-metrics");
  });
});

test.describe("Digital House scoring audit", () => {
  test.use({ hasTouch: false, isMobile: false });

  test("easy best-case board still reports unresolved guest isolation", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await openGame(page, "easy");

    await placeDevice(page, "work-laptop", "office");
    await placeDevice(page, "personal-phone", "bedroom");
    await placeDevice(page, "tablet", "bedroom");
    await placeDevice(page, "guest-phone", "entry-exterior");
    await placeDevice(page, "printer", "kitchen");
    await placeDevice(page, "smart-tv", "living-room");
    await placeDevice(page, "smart-speaker", "living-room");
    await placeDevice(page, "game-console", "living-room");
    await placeDevice(page, "doorbell-camera", "entry-exterior");
    await placeDevice(page, "camera-hub", "kitchen");

    await page
      .getByRole("button", { name: /results/i })
      .scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /results/i }).click();
    const summary = page.getByLabel(/after-action report/i);
    await expect(summary).toBeVisible();
    await expect(page.getByTestId("dh-summary-score")).toHaveText("88");
    await expect(summary).toContainText(
      "Easy mode does not include a separate Guest network.",
    );
    await expect(summary).toContainText(
      "Easy mode does not include a Guest network. Try Medium or Hard to separate visitor devices.",
    );

    await attachScreenshot(page, testInfo, "scoring-easy-best-case");
  });

  test("hard ideal board still reaches 100 with no open risk section", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await openGame(page, "hard");

    await assignRoomZone(page, "office", "main");
    await assignRoomZone(page, "bedroom", "main");
    await assignRoomZone(page, "living-room", "iot");
    await assignRoomZone(page, "kitchen", "guest");
    await assignRoomZone(page, "entry-exterior", "iot");

    await placeDevice(page, "work-laptop", "office");
    await placeDevice(page, "personal-phone", "bedroom");
    await placeDevice(page, "tablet", "bedroom");
    await placeDevice(page, "guest-phone", "kitchen");
    await placeDevice(page, "printer", "entry-exterior");
    await placeDevice(page, "smart-tv", "living-room");
    await placeDevice(page, "smart-speaker", "living-room");
    await placeDevice(page, "game-console", "living-room");
    await placeDevice(page, "doorbell-camera", "entry-exterior");
    await placeDevice(page, "camera-hub", "entry-exterior");

    await page
      .getByRole("button", { name: /results/i })
      .scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /results/i }).click();
    const summary = page.getByLabel(/after-action report/i);
    await expect(summary).toBeVisible();
    await expect(page.getByTestId("dh-summary-score")).toHaveText("100");
    await expect(summary).not.toContainText(/what still adds risk/i);

    await attachScreenshot(page, testInfo, "scoring-hard-perfect");
  });
});
