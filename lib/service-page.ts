import fs from "fs";
import path from "path";
import type {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsContext,
} from "next";
import type { ServiceSlugProps } from "@/components";
import { isJsonFile, jsonFileName, jsonFileStem, publicFileExists, readJsonFile } from "./build-files";

const TEMPLATES_DIR = path.join(process.cwd(), "data/services/slug-templates");
export const SERVICE_LIMITS = { related: 3 };

type ServiceSection = { image?: { src: string; alt: string } };
type ServiceData = Record<string, unknown> & { title: string; sections?: ServiceSection[]; related?: RelatedLink[] };

export const getStaticPathsForServices: GetStaticPaths = () => {
  const files = fs.readdirSync(TEMPLATES_DIR);
  const paths = files
    .filter(isJsonFile)
    .map((file) => ({ params: { slug: jsonFileStem(file) } }));
  return { paths, fallback: false };
};

export function makeGetStaticSlugProps(): GetStaticProps {
  return ({ params }: GetStaticPropsContext) => {
    const slug = String(params?.slug || "");
    const filePath = path.join(TEMPLATES_DIR, jsonFileName(slug));
    if (!fs.existsSync(filePath)) return { notFound: true };

    const service = readJsonFile<ServiceData>(filePath);

    if (Array.isArray(service.sections)) {
      service.sections = service.sections.map(
        (section) => {
          if (!section.image || publicFileExists(section.image.src)) {
            return section;
          }
          const copy = { ...section };
          delete copy.image;
          return copy;
        },
      );
    }

    let related = service.related || [];
    if (related.length > SERVICE_LIMITS.related) {
      related = related.slice(0, SERVICE_LIMITS.related);
    } else {
      const files = fs
        .readdirSync(TEMPLATES_DIR)
        .filter((file) => isJsonFile(file) && file !== jsonFileName(slug));

      const additional = files
        .map(jsonFileStem)
        .slice(0, SERVICE_LIMITS.related - related.length)
        .map((relatedSlug) => {
          const relatedPath = path.join(TEMPLATES_DIR, jsonFileName(relatedSlug));
          const relatedService = readJsonFile<ServiceData>(relatedPath);
          return { label: relatedService.title, slug: relatedSlug };
        });

      related = [...related, ...additional];
    }

    return { props: { service, related } };
  };
}

export type RelatedLink = { label: string; slug: string };
export type IndividualServiceSlugProps = ServiceSlugProps & {
  related?: RelatedLink[];
};
