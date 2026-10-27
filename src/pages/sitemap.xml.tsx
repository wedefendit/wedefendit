import fs from "fs";
import path from "path";
import type { GetServerSideProps } from "next";
import { isJsonFile, jsonFileStem } from "@/lib/build-files";
import { SITE_URL } from "@/lib/og";

const Sitemap = () => null;

const PAGES_DIR = path.join(process.cwd(), "src/pages");
const LOCAL_SERVICE_DIR = path.join(
  process.cwd(),
  "data/services/slug-templates",
);
const REMOTE_SERVICE_DIR = path.join(
  process.cwd(),
  "data/services/remote/services",
);
const REMOTE_PAGE_DIR = path.join(process.cwd(), "src/pages/services/remote");
const LOCATION_DIR = path.join(process.cwd(), "data/locations");
const PAGE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);
const SITEMAP_PATH = { tsx: "sitemap.xml.tsx", ts: "sitemap.xml.ts", api: "api/", index: "index", openParameter: "[", closeParameter: "]" };
const PRIORITY = { home: "1.00", services: "0.95", contact: "0.90", primary: "0.85", secondary: "0.80", standard: "0.70", legal: "0.30", sigintPrivacy: "0.25", hidden: "0.10" };
const EXACT_PRIORITY: Record<string, string> = {
  services: PRIORITY.services,
  contact: PRIORITY.contact,
  sigint: PRIORITY.primary,
  "service-areas": PRIORITY.secondary,
  awareness: PRIORITY.secondary,
  "services/remote": PRIORITY.secondary,
  about: PRIORITY.standard,
  privacy: PRIORITY.legal,
  terms: PRIORITY.legal,
  "privacy/sigint": PRIORITY.sigintPrivacy,
  "thank-you": PRIORITY.hidden,
  "sigint/confirmed": PRIORITY.hidden,
};

function readJsonSlugs(dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter(isJsonFile)
    .map(jsonFileStem)
    .sort((left, right) => left.localeCompare(right));
}

function readNestedIndexSlugs(dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter(
      (entry) =>
        fs.existsSync(path.join(dir, entry.name, "index.tsx")) ||
        fs.existsSync(path.join(dir, entry.name, "index.ts")),
    )
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function toRoute(relativeFilePath: string) {
  const normalizedPath = relativeFilePath.replaceAll("\\", "/");

  if (
    normalizedPath === SITEMAP_PATH.tsx ||
    normalizedPath === SITEMAP_PATH.ts ||
    normalizedPath.startsWith(SITEMAP_PATH.api)
  ) {
    return null;
  }

  const withoutExtension = normalizedPath.replace(/\.(tsx|ts|jsx|js)$/, "");
  const segments = withoutExtension.split("/").filter(Boolean);

  if (
    segments.length === 0 ||
    segments.some((segment) => segment.startsWith("_")) ||
    segments.some((segment) => segment.includes(SITEMAP_PATH.openParameter) || segment.includes(SITEMAP_PATH.closeParameter))
  ) {
    return null;
  }

  if (segments.at(-1) === SITEMAP_PATH.index) {
    segments.pop();
  }

  return segments.join("/");
}

function readPageRoutes(dir: string, baseDir = dir): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const routes: string[] = [];
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "api" || entry.name.startsWith("_")) {
        continue;
      }

      routes.push(...readPageRoutes(fullPath, baseDir));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!PAGE_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    const route = toRoute(path.relative(baseDir, fullPath));
    if (route !== null) {
      routes.push(route);
    }
  }

  return routes;
}

function priorityForRoute(route: string) {
  if (route === "") return PRIORITY.home;
  const exact = EXACT_PRIORITY[route];
  if (exact) return exact;
  if (route.startsWith("services/") && !route.startsWith("services/remote")) {
    return PRIORITY.primary;
  }
  if (route.startsWith("service-areas/")) return PRIORITY.primary;
  return PRIORITY.standard;
}

export const getServerSideProps: GetServerSideProps = ({ res }) => {
  const now = new Date().toISOString();
  const pageRoutes = readPageRoutes(PAGES_DIR);
  const serviceSlugs = readJsonSlugs(LOCAL_SERVICE_DIR);
  const remoteSlugs = Array.from(
    new Set([
      ...readJsonSlugs(REMOTE_SERVICE_DIR),
      ...readNestedIndexSlugs(REMOTE_PAGE_DIR),
    ]),
  ).sort((a, b) => a.localeCompare(b));
  const locationSlugs = readJsonSlugs(LOCATION_DIR);
  const localServiceRoutes = serviceSlugs.map((slug) => `services/${slug}`);
  const remoteServiceRoutes = remoteSlugs.map(
    (slug) => `services/remote/${slug}`,
  );
  const locationRoutes = locationSlugs.map((slug) => `service-areas/${slug}`);
  const routes = Array.from(
    new Set([
      ...pageRoutes,
      ...localServiceRoutes,
      ...remoteServiceRoutes,
      ...locationRoutes,
    ]),
  ).sort((a, b) => {
    const priorityDelta =
      Number.parseFloat(priorityForRoute(b)) -
      Number.parseFloat(priorityForRoute(a));

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return a.localeCompare(b);
  });

  const toUrlTag = (loc: string, priority = PRIORITY.standard) =>
    `
    <url>
      <loc>${loc}</loc>
      <lastmod>${now}</lastmod>
      <priority>${priority}</priority>
    </url>`.trim();

  let urls = "";

  for (const route of routes) {
    urls += toUrlTag(`${SITE_URL}/${route}`, priorityForRoute(route));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.write(xml);
  res.end();

  return Promise.resolve({ props: {} });
};

export default Sitemap;
