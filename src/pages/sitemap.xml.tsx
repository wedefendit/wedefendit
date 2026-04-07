import fs from "fs";
import path from "path";
import { GetServerSideProps } from "next";

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
const PAGE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);

function readJsonSlugs(dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort();
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
    .sort();
}

function toRoute(relativeFilePath: string) {
  const normalizedPath = relativeFilePath.replaceAll("\\", "/");

  if (
    normalizedPath === "sitemap.xml.tsx" ||
    normalizedPath === "sitemap.xml.ts" ||
    normalizedPath.startsWith("api/")
  ) {
    return null;
  }

  const withoutExtension = normalizedPath.replace(/\.(tsx|ts|jsx|js)$/, "");
  const segments = withoutExtension.split("/").filter(Boolean);

  if (
    segments.length === 0 ||
    segments.some((segment) => segment.startsWith("_")) ||
    segments.some((segment) => segment.includes("[") || segment.includes("]"))
  ) {
    return null;
  }

  if (segments.at(-1) === "index") {
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
  if (route === "") return "1.00";
  if (route === "services") return "0.95";
  if (route === "contact") return "0.90";
  if (route === "sigint") return "0.85";
  if (route.startsWith("services/") && !route.startsWith("services/remote")) {
    return "0.85";
  }
  if (route === "awareness" || route === "services/remote") return "0.80";
  if (route === "about" || route.startsWith("services/remote/")) return "0.70";
  if (route === "privacy" || route === "terms") return "0.30";
  if (route === "privacy/sigint") return "0.25";
  if (route === "thank-you" || route === "sigint/confirmed") return "0.10";

  return "0.70";
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = "https://www.wedefendit.com";
  const now = new Date().toISOString();
  const pageRoutes = readPageRoutes(PAGES_DIR);
  const serviceSlugs = readJsonSlugs(LOCAL_SERVICE_DIR);
  const remoteSlugs = Array.from(
    new Set([
      ...readJsonSlugs(REMOTE_SERVICE_DIR),
      ...readNestedIndexSlugs(REMOTE_PAGE_DIR),
    ]),
  ).sort((a, b) => a.localeCompare(b));
  const localServiceRoutes = serviceSlugs.map((slug) => `services/${slug}`);
  const remoteServiceRoutes = remoteSlugs.map(
    (slug) => `services/remote/${slug}`,
  );
  const routes = Array.from(
    new Set([...pageRoutes, ...localServiceRoutes, ...remoteServiceRoutes]),
  ).sort((a, b) => {
    const priorityDelta =
      Number.parseFloat(priorityForRoute(b)) -
      Number.parseFloat(priorityForRoute(a));

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return a.localeCompare(b);
  });

  const toUrlTag = (loc: string, priority = "0.70") =>
    `
    <url>
      <loc>${loc}</loc>
      <lastmod>${now}</lastmod>
      <priority>${priority}</priority>
    </url>`.trim();

  let urls = "";

  for (const route of routes) {
    urls += toUrlTag(`${baseUrl}/${route}`, priorityForRoute(route));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default Sitemap;
