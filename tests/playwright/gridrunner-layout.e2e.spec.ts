/**
 * GRIDRUNNER UI Layout Regression Tests
 *
 * Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
 *
 * Run: npx playwright test tests/playwright/gridrunner-layout.e2e.spec.ts
 */

import { test, expect, type Page, type Locator } from "@playwright/test";

const PHONE = { width: 375, height: 667 };
const PHONE_LAND = { width: 667, height: 375 };
const PHONE_SMALL = { width: 320, height: 568 };
const TABLET = { width: 768, height: 1024 };
const TABLET_LAND = { width: 1024, height: 768 };
const DESKTOP = { width: 1280, height: 800 };
const DESKTOP_MID = { width: 1176, height: 800 };
const LARGE = { width: 1920, height: 1080 };
const ULTRAWIDE = { width: 2560, height: 1440 };

const FRAME_VIEWPORTS = [
  { name: "iPhone SE", ...PHONE },
  { name: "iPhone SE landscape", ...PHONE_LAND },
  { name: "iPhone 5", ...PHONE_SMALL },
  { name: "iPad", ...TABLET },
  { name: "iPad landscape", ...TABLET_LAND },
  { name: "desktop 1280", ...DESKTOP },
  { name: "desktop 1176", ...DESKTOP_MID },
  { name: "1080p", ...LARGE },
  { name: "1440p", ...ULTRAWIDE },
];

const CONTROLS_VIEWPORTS = [
  { name: "phone", ...PHONE },
  { name: "tablet", ...TABLET },
  { name: "desktop", ...DESKTOP },
  { name: "large", ...LARGE },
];

const CONTROL_IDS = [
  "gr-dpad",
  "gr-action-buttons",
  "gr-btn-select",
  "gr-btn-start",
];

const GR_URL = "/awareness/gridrunner";

const SAVE_DATA = JSON.stringify({
  version: 1,
  playerName: "TESTOP",
  player: {
    level: 3,
    xp: 40,
    xpToNext: 100,
    integrity: 120,
    maxIntegrity: 120,
    compute: 60,
    maxCompute: 60,
    bandwidth: 12,
    firewall: 7,
  },
  inventory: [],
  equippedTools: [
    {
      id: "t1",
      baseToolId: "nmap",
      rarity: "common",
      power: 12,
      accuracy: 90,
      energyCost: 5,
      prefix: null,
      suffix: null,
      type: "recon",
    },
    {
      id: "t2",
      baseToolId: "wireshark",
      rarity: "common",
      power: 8,
      accuracy: 95,
      energyCost: 3,
      prefix: null,
      suffix: null,
      type: "recon",
    },
    {
      id: "t3",
      baseToolId: "metasploit",
      rarity: "common",
      power: 20,
      accuracy: 75,
      energyCost: 15,
      prefix: null,
      suffix: null,
      type: "exploit",
    },
    {
      id: "t4",
      baseToolId: "firewall-rule",
      rarity: "common",
      power: 10,
      accuracy: 85,
      energyCost: 8,
      prefix: null,
      suffix: null,
      type: "defense",
    },
  ],
  currentZone: "arcade",
  currentPosition: { x: 5, y: 3 },
  defeatedBosses: [],
  completedTutorial: false,
  bits: 50,
  credits: 0,
  playTime: 300,
  savedAt: new Date().toISOString(),
});

async function loadOverworld(page: Page) {
  await page.goto(GR_URL);
  await page.getByTestId("gr-frame").waitFor({ state: "visible" });
  await page.evaluate(
    (s) => localStorage.setItem("dis-gridrunner-save", s),
    SAVE_DATA,
  );
  await page.reload();
  await page.getByTestId("gr-frame").waitFor({ state: "visible" });
  const cont = page.getByText("CONTINUE");
  await cont.waitFor({ state: "visible", timeout: 5000 });
  await cont.click();
  await page
    .getByTestId("gr-controls")
    .waitFor({ state: "visible", timeout: 5000 });
}

async function triggerBattle(page: Page) {
  for (let i = 0; i < 60; i++) {
    if (
      await page
        .getByTestId("gr-battle")
        .isVisible()
        .catch(() => false)
    )
      return true;
    await page.keyboard.press(i % 2 === 0 ? "ArrowRight" : "ArrowLeft");
    await page.waitForTimeout(60);
  }
  return false;
}

async function fontSize(loc: Locator): Promise<number> {
  return loc.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
}

async function isInsideFrame(page: Page, testId: string): Promise<boolean> {
  const frame = page.getByTestId("gr-frame");
  const target = page.getByTestId(testId);
  if (!(await target.isVisible().catch(() => false))) return false;
  const fb = await frame.boundingBox();
  const tb = await target.boundingBox();
  if (!fb || !tb) return false;
  return (
    tb.x >= fb.x - 2 &&
    tb.y >= fb.y - 2 &&
    tb.x + tb.width <= fb.x + fb.width + 2 &&
    tb.y + tb.height <= fb.y + fb.height + 2
  );
}

/* ================================================================== */
/*  FRAME CONTAINMENT — per viewport                                  */
/* ================================================================== */

test.describe("Frame containment", () => {
  for (const vp of FRAME_VIEWPORTS) {
    test(`frame width fits ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(GR_URL);
      const frame = page.getByTestId("gr-frame");
      await frame.waitFor({ state: "visible" });
      const box = await frame.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeLessThanOrEqual(vp.width + 1);
    });

    test(`no horizontal scroll on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(GR_URL);
      await page.getByTestId("gr-frame").waitFor({ state: "visible" });
      const sw = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(sw).toBeLessThanOrEqual(vp.width + 1);
    });

    test(`no vertical scroll on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(GR_URL);
      await page.getByTestId("gr-frame").waitFor({ state: "visible" });
      const sh = await page.evaluate(
        () => document.documentElement.scrollHeight,
      );
      expect(sh).toBeLessThanOrEqual(vp.height + 1);
    });
  }

  test("frame capped at 640px on 1176px desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP_MID);
    await page.goto(GR_URL);
    const box = await page.getByTestId("gr-frame").boundingBox();
    expect(box!.width).toBeLessThanOrEqual(641);
    expect(box!.width).toBeGreaterThan(400);
  });

  test("frame capped at 640px on 1920px desktop", async ({ page }) => {
    await page.setViewportSize(LARGE);
    await page.goto(GR_URL);
    const box = await page.getByTestId("gr-frame").boundingBox();
    expect(box!.width).toBeLessThanOrEqual(641);
  });

  test("frame uses >= 85% viewport width on phone portrait", async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto(GR_URL);
    const box = await page.getByTestId("gr-frame").boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(PHONE.width * 0.85);
  });
});

/* ================================================================== */
/*  CONTROLS WITHIN FRAME — per viewport per element                  */
/* ================================================================== */

test.describe("Controls within frame", () => {
  for (const vp of CONTROLS_VIEWPORTS) {
    for (const id of CONTROL_IDS) {
      test(`${id} inside frame on ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await loadOverworld(page);
        expect(
          await isInsideFrame(page, id),
          `${id} overflows on ${vp.name}`,
        ).toBe(true);
      });
    }
  }
});

/* ================================================================== */
/*  RESPONSIVE CONTROL SIZING — per viewport                          */
/* ================================================================== */

test.describe("Responsive control sizing", () => {
  const DPAD_SIZES = [
    { name: "phone", vp: PHONE, min: 30, max: 34 },
    { name: "tablet", vp: TABLET, min: 38, max: 42 },
    { name: "desktop", vp: DESKTOP, min: 46, max: 50 },
  ];
  for (const { name, vp, min, max } of DPAD_SIZES) {
    test(`D-pad button ${min}-${max}px on ${name}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await loadOverworld(page);
      const box = await page.getByTestId("gr-dpad-up").boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThanOrEqual(min);
      expect(box!.width).toBeLessThanOrEqual(max);
    });
  }

  const AB_SIZES = [
    { name: "phone", vp: PHONE, min: 30, max: 34 },
    { name: "tablet", vp: TABLET, min: 38, max: 42 },
    { name: "desktop", vp: DESKTOP, min: 46, max: 50 },
  ];
  for (const { name, vp, min, max } of AB_SIZES) {
    test(`A button ${min}-${max}px on ${name}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await loadOverworld(page);
      const box = await page.getByTestId("gr-btn-a").boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThanOrEqual(min);
      expect(box!.width).toBeLessThanOrEqual(max);
    });

    test(`B button ${min}-${max}px on ${name}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await loadOverworld(page);
      const box = await page.getByTestId("gr-btn-b").boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThanOrEqual(min);
      expect(box!.width).toBeLessThanOrEqual(max);
    });
  }
});

/* ================================================================== */
/*  PLAYER HUD — per viewport                                         */
/* ================================================================== */

test.describe("Player HUD", () => {
  for (const { name, vp } of [
    { name: "phone", vp: PHONE },
    { name: "tablet", vp: TABLET },
    { name: "desktop", vp: DESKTOP },
  ]) {
    test(`HUD compact (under 120px) on ${name}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await loadOverworld(page);
      const hud = page.getByTestId("gr-player-hud");
      await hud.waitFor({ state: "visible" });
      const box = await hud.boundingBox();
      expect(box!.height).toBeLessThan(120);
    });

    test(`HUD text <= 12px on ${name}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await loadOverworld(page);
      const spans = page.getByTestId("gr-player-hud").locator("span");
      const count = await spans.count();
      for (let i = 0; i < count; i++) {
        const size = await fontSize(spans.nth(i));
        expect(size).toBeLessThanOrEqual(12.5);
      }
    });
  }
});

/* ================================================================== */
/*  BATTLE LAYOUT                                                     */
/* ================================================================== */

test.describe("Battle layout", () => {
  test("battle inside frame on phone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    expect(await isInsideFrame(page, "gr-battle")).toBe(true);
  });

  test("arena min 60px for sprites on phone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const arena = page.getByTestId("gr-battle").locator("> div").first();
    const box = await arena.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(60);
  });

  test("arena uses flex-1", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const grow = await page.getByTestId("gr-battle").evaluate((el) => {
      const arena = el.querySelector(":scope > div:first-child");
      return arena ? getComputedStyle(arena).flexGrow : "missing";
    });
    expect(grow).toBe("1");
  });

  test("tool grid is 2 columns on phone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const actions = page.getByTestId("gr-battle-actions");
    if (!(await actions.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    const display = await actions.evaluate(
      (el) => getComputedStyle(el).display,
    );
    expect(display).toBe("grid");
    const cols = await actions.evaluate(
      (el) =>
        getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
    );
    expect(cols).toBe(2);
  });

  test("RUN button separate from tool grid", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const run = page.getByTestId("gr-battle-run");
    if (!(await run.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    const inside = await run.evaluate(
      (el) => el.closest("[data-testid='gr-battle-actions']") !== null,
    );
    expect(inside).toBe(false);
  });

  test("RUN button inside frame on phone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    expect(await isInsideFrame(page, "gr-battle-run")).toBe(true);
  });

  test("no tool button truncation on phone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const buttons = page.getByTestId("gr-battle-actions").locator("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const clipped = await buttons
        .nth(i)
        .evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(clipped, `tool ${i} truncated`).toBe(false);
    }
  });

  test("no tool button truncation on smallest phone", async ({ page }) => {
    await page.setViewportSize(PHONE_SMALL);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const buttons = page.getByTestId("gr-battle-actions").locator("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const clipped = await buttons
        .nth(i)
        .evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(clipped, `tool ${i} truncated at 320px`).toBe(false);
    }
  });

  test("tool buttons meet 44px touch target", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const buttons = page.getByTestId("gr-battle-actions").locator("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("RUN meets 44px touch target", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const box = await page.getByTestId("gr-battle-run").boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("battle text <= 12px on phone (no text-sm)", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const elems = page.getByTestId("gr-battle").locator("span, button, p");
    const count = await elems.count();
    for (let i = 0; i < count; i++) {
      expect(await fontSize(elems.nth(i))).toBeLessThanOrEqual(12.5);
    }
  });

  test("battle log compact (under 100px) on phone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const log = page.getByTestId("gr-battle-log");
    if (!(await log.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    expect((await log.boundingBox())!.height).toBeLessThanOrEqual(100);
  });

  test("no wasted space below RUN on phone", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await loadOverworld(page);
    if (!(await triggerBattle(page))) {
      test.skip();
      return;
    }
    const battleBox = await page.getByTestId("gr-battle").boundingBox();
    const runBox = await page.getByTestId("gr-battle-run").boundingBox();
    if (!battleBox || !runBox) {
      test.skip();
      return;
    }
    const gap = battleBox.y + battleBox.height - (runBox.y + runBox.height);
    expect(gap).toBeLessThanOrEqual(16);
  });
});
