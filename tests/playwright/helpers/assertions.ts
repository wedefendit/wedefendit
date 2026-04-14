/**
 * Custom Playwright assertions for UI quality.
 * Every helper maps to a real shipped bug -- JSDoc says which one.
 */

import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Assert every interactive element meets 44x44 minimum touch target.
 * Bug: EndSummaryModal X button was 28px (p-1.5 + 16px icon).
 */
export async function assertTouchTargets(
  page: Page,
  opts: { minSize?: number; exclude?: string } = {},
) {
  const min = opts.minSize ?? 44;
  const exclude = opts.exclude ?? "";

  const failures = await page.evaluate(
    ({ min, exclude }) => {
      const els = Array.from(
        document.querySelectorAll(
          'button, a, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      const bad: { tag: string; id: string; w: number; h: number }[] = [];
      for (const el of els) {
        if (exclude && el.matches(exclude)) continue;
        const s = getComputedStyle(el);
        if (
          s.display === "none" ||
          s.visibility === "hidden" ||
          s.opacity === "0"
        )
          continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.width < min || r.height < min) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            id:
              el.getAttribute("data-testid") ??
              el.getAttribute("aria-label") ??
              el.textContent?.slice(0, 30)?.trim() ??
              "",
            w: Math.round(r.width),
            h: Math.round(r.height),
          });
        }
      }
      return bad;
    },
    { min, exclude },
  );

  if (failures.length > 0) {
    const report = failures
      .map((f) => `  ${f.tag}[${f.id}] = ${f.w}x${f.h}`)
      .join("\n");
    expect
      .soft(failures.length, `Touch targets below ${min}px:\n${report}`)
      .toBe(0);
  }
}

/**
 * Assert the element at the center of a locator is actually that element,
 * not something painted on top of it.
 * Bug: EndSummaryModal X occluded by centered "AFTER-ACTION REPORT" badge.
 */
export async function assertNotOccluded(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box, "Element has no bounding box").toBeTruthy();
  if (!box) return;

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  const topId = await locator.page().evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return "__nothing__";
      const btn = el.closest('button, a, [role="button"]');
      const target = btn ?? el;
      return (
        target.getAttribute("data-testid") ??
        target.getAttribute("aria-label") ??
        target.tagName.toLowerCase()
      );
    },
    { x: cx, y: cy },
  );

  const expectedId = await locator.evaluate(
    (el) =>
      el.getAttribute("data-testid") ??
      el.getAttribute("aria-label") ??
      el.tagName.toLowerCase(),
  );

  expect(
    topId,
    `"${expectedId}" occluded by "${topId}" at (${Math.round(cx)},${Math.round(cy)})`,
  ).toBe(expectedId);
}

/**
 * Assert a text element is NOT being CSS-truncated.
 * Bug: Analysis card feedback truncated by `truncate` class.
 */
export async function assertNoTextTruncation(locator: Locator) {
  const info = await locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      truncated:
        s.textOverflow === "ellipsis" &&
        s.overflow === "hidden" &&
        s.whiteSpace === "nowrap" &&
        el.scrollWidth > el.clientWidth,
      sw: el.scrollWidth,
      cw: el.clientWidth,
      text: el.textContent?.slice(0, 50) ?? "",
    };
  });
  expect(
    info.truncated,
    `Text truncated: "${info.text}..." (${info.sw} > ${info.cw})`,
  ).toBe(false);
}

/**
 * Assert a fixed overlay is above the site nav (not trapped in a stacking context).
 * Bug: `isolation: isolate` on game root trapped modals behind nav z-50.
 */
export async function assertOverlayAboveNav(
  page: Page,
  overlaySelector: string,
) {
  const navBox = await page.locator("nav").first().boundingBox();
  if (!navBox) return;

  const cx = navBox.x + navBox.width / 2;
  const cy = navBox.y + navBox.height / 2;

  const isOverlay = await page.evaluate(
    ({ x, y, sel }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return false;
      return !!el.closest(sel) || !!el.closest('[class*="fixed"]');
    },
    { x: cx, y: cy, sel: overlaySelector },
  );

  expect(isOverlay, `Overlay "${overlaySelector}" is NOT above the nav`).toBe(
    true,
  );
}

/**
 * Assert a scrollable element can actually scroll.
 * Bug: Modal content not scrollable on touch devices.
 */
export async function assertScrollable(locator: Locator) {
  const result = await locator.evaluate((el) => {
    if (el.scrollHeight <= el.clientHeight) return "no-overflow";
    const before = el.scrollTop;
    el.scrollTo({ top: el.scrollHeight });
    const after = el.scrollTop;
    el.scrollTo({ top: before });
    return after > before ? "scrollable" : "stuck";
  });
  if (result === "no-overflow") return;
  expect(result, "Scrollable container is stuck").toBe("scrollable");
}
