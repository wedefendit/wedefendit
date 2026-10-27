import Link from "next/link";
import {
  Meta,
  BreadCrumbs,
  PageContainer,
  RemoteServicesCTA,
  ServiceAreaAndBooking,
} from "@/components";
import { ServiceCard, serviceSlug } from "@/components/Service/Card";
import { HeroBanner } from "@/components/HeroBanner";
import { localBusinessLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/og";

export type Service = {
  id: string;
  title: string;
  headline: string;
  icons: string[];
  summary: string;
  cta: string;
  slug?: string;
};

export type ServicesPageProps = Readonly<{
  h1: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
  services: Service[];
  remote?: boolean;
}>;

const SCHEMA = { context: "@context", type: "@type", graph: "@graph", url: "https://schema.org", breadcrumbList: "BreadcrumbList", listItem: "ListItem", service: "Service", itemList: "ItemList", collectionPage: "CollectionPage" };
const PAGE_LABEL = { home: "Home", services: "Services", remoteServices: "Remote Services" };

export default function ServicePage(props: ServicesPageProps) {
  const { meta, h1, services, remote } = props;
  const isRemote = remote || false;

  const canonical = isRemote
    ? `${SITE_URL}/services/remote`
    : `${SITE_URL}/services`;

  const breadcrumbLd = isRemote
    ? {
        [SCHEMA.context]: SCHEMA.url,
        [SCHEMA.type]: SCHEMA.breadcrumbList,
        itemListElement: [
          {
            [SCHEMA.type]: SCHEMA.listItem,
            position: 1,
            name: PAGE_LABEL.home,
            item: `${SITE_URL}/`,
          },
          {
            [SCHEMA.type]: SCHEMA.listItem,
            position: 2,
            name: PAGE_LABEL.services,
            item: `${SITE_URL}/services`,
          },
          {
            [SCHEMA.type]: SCHEMA.listItem,
            position: 3,
            name: PAGE_LABEL.remoteServices,
            item: canonical,
          },
        ],
      }
    : {
        [SCHEMA.context]: SCHEMA.url,
        [SCHEMA.type]: SCHEMA.breadcrumbList,
        itemListElement: [
          {
            [SCHEMA.type]: SCHEMA.listItem,
            position: 1,
            name: PAGE_LABEL.home,
            item: `${SITE_URL}/`,
          },
          {
            [SCHEMA.type]: SCHEMA.listItem,
            position: 2,
            name: PAGE_LABEL.services,
            item: canonical,
          },
        ],
      };

  const servicesCollectionLd = {
    [SCHEMA.context]: SCHEMA.url,
    [SCHEMA.type]: SCHEMA.collectionPage,
    name: meta.title || "Services | Defend I.T. Solutions",
    description: meta.description,
    url: canonical,
    mainEntity: {
      [SCHEMA.type]: SCHEMA.itemList,
      itemListElement: services.map((s, i) => {
        const slug = s.slug || s.id || serviceSlug(s.title);
        const url = `${SITE_URL}/services/${
          isRemote ? `remote/${slug}` : slug
        }`;
        return {
          [SCHEMA.type]: SCHEMA.listItem,
          position: i + 1,
          item: {
            [SCHEMA.type]: SCHEMA.service,
            name: s.title,
            description: s.summary || undefined,
            url,
            provider: { "@id": `${SITE_URL}/#organization` },
          },
        };
      }),
    },
  };

  const existingStructuredData = meta?.structuredData;
  let existingGraph = [];
  if (existingStructuredData) {
    const graph = existingStructuredData[SCHEMA.graph];
    existingGraph = Array.isArray(graph) ? graph : [existingStructuredData];
  }

  const metaWithStructured = {
    ...meta,
    url: canonical,
    canonical,
    structuredData: {
      [SCHEMA.context]: SCHEMA.url,
      [SCHEMA.graph]: [
        ...existingGraph,
        breadcrumbLd,
        servicesCollectionLd,
        localBusinessLd,
      ],
    },
  };

  return (
    <>
      <Meta {...metaWithStructured} />

      <PageContainer>
        <div className="mx-auto w-full max-w-6xl px-4 pt-1 sm:px-6">
          <BreadCrumbs
            includeJsonLd={false}
            items={
              isRemote
                ? [
                    { name: PAGE_LABEL.home, href: "/" },
                    { name: PAGE_LABEL.services, href: "/services" },
                    { name: PAGE_LABEL.remoteServices, href: canonical },
                  ]
                : [
                    { name: PAGE_LABEL.home, href: "/" },
                    { name: PAGE_LABEL.services, href: canonical },
                  ]
            }
            baseUrl={SITE_URL}
          />
        </div>

        <HeroBanner
          dark={
            isRemote
              ? "/img/about/about-hero-dark.jpg"
              : "/img/locations/ocala-hero-dark.jpg"
          }
          light={
            isRemote
              ? "/img/about/about-hero-light.jpg"
              : "/img/locations/ocala-hero-light.jpg"
          }
          alt={`${h1}, Defend I.T. Solutions`}
        >
          <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
            {isRemote
              ? "Local Support Plans and Nationwide Training"
              : "Serving Ocala, Belleview, and The Villages"}
          </p>
          <h1 className="mt-4 text-balance text-display tracking-display font-semibold text-ink">
            {h1}
          </h1>
          <p className="mt-5 max-w-lg text-lead text-ink-muted">
            {isRemote
              ? "Get secure remote tech support for enrolled devices, or book online technology training and cybersecurity tutoring without a support plan."
              : "Choose the service that matches your problem. We help homes and small businesses with computer repair, malware removal, Wi-Fi, account security, scam protection, and connected devices."}
          </p>
        </HeroBanner>

        <div className="max-w-7xl mx-auto w-full px-3 pb-10 sm:px-4 lg:px-6 space-y-8 sm:space-y-10">
          <h2 className="sr-only">
            {isRemote ? "Remote services" : "Our services"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service: Service) => (
              <ServiceCard
                key={service.id}
                {...service}
                remote={isRemote}
                slug={service.slug || service.id || serviceSlug(service.title)}
              />
            ))}
          </div>

          <RemoteServicesCTA isRemote={isRemote} />
          <ServiceAreaAndBooking />

          <section className="text-sm text-ink-muted italic text-center max-w-3xl mx-auto">
            <p>
              Not sure which service fits?{" "}
              <Link href="/contact" className="text-accent hover:underline">
                contact us
              </Link>{" "}
              and we will help you choose the right starting point.
            </p>
          </section>
        </div>
      </PageContainer>
    </>
  );
}

export { ServicePage };
