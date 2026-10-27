export const SITE_URL = "https://www.wedefendit.com";
const OG_DIR = `${SITE_URL}/img/og`;

export const DEFAULT_OG_IMAGE = `${OG_DIR}/og-home-preview.jpg`;

export function ogImageUrl(name?: string): string {
  return name?.startsWith("og-")
    ? `${OG_DIR}/${name}.jpg`
    : DEFAULT_OG_IMAGE;
}
