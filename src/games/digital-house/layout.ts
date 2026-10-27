export enum ViewportBandValue {
  Phone = "phone",
  Narrow = "narrow",
  Wide = "wide",
  Ultra = "ultra",
}

export type ViewportBand = `${ViewportBandValue}`;

const NARROW_MIN_WIDTH = 820;
const WIDE_MIN_WIDTH = 1280;
const ULTRA_MIN_WIDTH = 1536;
const COMPACT_DESKTOP_MAX_WIDTH = 1100;
const THREE_COLUMN_MIN_RAIL_WIDTH = 520;
const FOUR_COLUMN_MIN_RAIL_WIDTH = 760;

export function widthToBand(width: number): ViewportBand {
  if (width < NARROW_MIN_WIDTH) return ViewportBandValue.Phone;
  if (width < WIDE_MIN_WIDTH) return ViewportBandValue.Narrow;
  if (width < ULTRA_MIN_WIDTH) return ViewportBandValue.Wide;
  return ViewportBandValue.Ultra;
}

export function isCompactDesktopLayout(width: number): boolean {
  return width >= NARROW_MIN_WIDTH && width < COMPACT_DESKTOP_MAX_WIDTH;
}

export function inventoryColumnsForRail(width: number, railWidth: number): 2 | 3 | 4 {
  if (isCompactDesktopLayout(width)) return 2;
  const band = widthToBand(width);
  if (
    band === ViewportBandValue.Ultra &&
    railWidth >= FOUR_COLUMN_MIN_RAIL_WIDTH
  ) {
    return 4;
  }
  if (
    (band === ViewportBandValue.Wide || band === ViewportBandValue.Ultra) &&
    railWidth >= THREE_COLUMN_MIN_RAIL_WIDTH
  ) {
    return 3;
  }
  return 2;
}
