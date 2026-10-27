import fs from "fs";
import path from "path";
import type {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsContext,
} from "next";
import { isJsonFile, jsonFileName, jsonFileStem, publicFileExists, readJsonFile } from "./build-files";

export type LocationServiceLink = {
  label: string;
  slug: string;
  summary: string;
};

export type LocationFaq = {
  question: string;
  answer: string;
};

export type LocationImage = {
  src: string;
  alt: string;
};

export type LocationSection = {
  heading: string;
  paragraph?: string[];
  items?: string[];
  image?: LocationImage;
};

export type LocationTestimonial = {
  quote: string;
  attribution: string;
};

export type LocationCoverage = {
  townSquares: string[];
  nearbyTowns: string[];
  zips?: string[];
};

export type LocationContent = {
  id: string;
  slug: string;
  city: string;
  state: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  headline: string;
  heroImage?: LocationImage;
  ogImage?: string;
  banner?: LocationImage;
  intro: string[];
  areaServed: string[];
  coverage: LocationCoverage;
  sections: LocationSection[];
  services: LocationServiceLink[];
  testimonials: LocationTestimonial[];
  faq: LocationFaq[];
  cta: { label: string; link: string };
};

export type LocationSummary = {
  slug: string;
  city: string;
  state: string;
  headline: string;
};

const LOCATIONS_DIR = path.join(process.cwd(), "data/locations");

function readLocation(slug: string): LocationContent {
  return readJsonFile<LocationContent>(path.join(LOCATIONS_DIR, jsonFileName(slug)));
}

function resolveImages(location: LocationContent): LocationContent {
  const resolved: LocationContent = {
    ...location,
    sections: location.sections.map((section) => {
      if (section.image && publicFileExists(section.image.src)) {
        return section;
      }
      const copy = { ...section };
      delete copy.image;
      return copy;
    }),
  };

  if (resolved.heroImage && !publicFileExists(resolved.heroImage.src)) {
    delete resolved.heroImage;
  }
  if (resolved.banner && !publicFileExists(resolved.banner.src)) {
    delete resolved.banner;
  }
  if (resolved.ogImage && !publicFileExists(resolved.ogImage)) {
    delete resolved.ogImage;
  }

  return resolved;
}

function readLocationSlugs(): string[] {
  return fs
    .readdirSync(LOCATIONS_DIR)
    .filter(isJsonFile)
    .map(jsonFileStem);
}

export const getStaticPathsForLocations: GetStaticPaths = () => {
  const paths = readLocationSlugs().map((slug) => ({ params: { city: slug } }));
  return { paths, fallback: false };
};

export function makeGetStaticLocationProps(): GetStaticProps {
  return ({ params }: GetStaticPropsContext) => {
    const slug = String(params?.city || "");
    const filePath = path.join(LOCATIONS_DIR, jsonFileName(slug));

    if (!slug || !fs.existsSync(filePath)) {
      return { notFound: true };
    }

    return { props: { location: resolveImages(readLocation(slug)) } };
  };
}

export const getStaticLocationsIndexProps: GetStaticProps = () => {
  const locations: LocationSummary[] = readLocationSlugs()
    .map((slug) => readLocation(slug))
    .map(({ slug, city, state, headline }) => ({ slug, city, state, headline }))
    .sort((a, b) => a.city.localeCompare(b.city));

  return { props: { locations } };
};
