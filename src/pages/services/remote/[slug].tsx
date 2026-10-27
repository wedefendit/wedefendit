import fs from "fs";
import path from "path";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ServiceSlug, type ServiceSlugProps } from "@/components";
import { isJsonFile, jsonFileName, jsonFileStem, readJsonFile } from "@/lib/build-files";
import { SERVICE_LIMITS } from "@/lib/service-page";

const REMOTE_DIR = path.join(process.cwd(), "data/services/remote/services");

export const getStaticPaths: GetStaticPaths = () => {
  const files = fs.readdirSync(REMOTE_DIR);
  const paths = files
    .filter(isJsonFile)
    .map((file) => ({ params: { slug: jsonFileStem(file) } }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const slug = String(params?.slug || "");
  const filePath = path.join(REMOTE_DIR, jsonFileName(slug));

  if (!fs.existsSync(filePath)) return { notFound: true };

  const service = readJsonFile<ServiceSlugProps["service"]>(filePath);

  const files = fs.readdirSync(REMOTE_DIR).filter(isJsonFile);
  const related = files
    .map(jsonFileStem)
    .filter((relatedSlug) => relatedSlug !== slug)
    .slice(0, SERVICE_LIMITS.related)
    .map((relatedSlug) => {
      const relatedPath = path.join(REMOTE_DIR, jsonFileName(relatedSlug));
      const relatedService = readJsonFile<ServiceSlugProps["service"]>(relatedPath);
      return { label: relatedService.title || relatedSlug, slug: relatedSlug };
    });

  return { props: { service, related } };
};

export default function RemoteServicePage({ service, related }: ServiceSlugProps) {
  return <ServiceSlug service={service} remote related={related} />;
}
