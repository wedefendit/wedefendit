import {
  generateBreadCrumbJsonLd,
  generateFAQPageLd,
  generateRelatedServiceLd,
  generateServiceLd,
  localBusinessLd,
} from "@/lib/json-ld";
import Link from "next/link";
import { ogImageUrl, SITE_URL } from "@/lib/og";
import { ThemedImage } from "@/components/ThemedImage";
import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";
import {
  PageContainer,
  Meta,
  BookOnline,
  BreadCrumbs,
  FaqSection,
} from "@/components";
import { Card } from "@/components/Card";
import { DomeGrid } from "@/components/DomeGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { serviceIcon } from "./Card";

export type ServiceContent = {
  id: string;
  title: string;
  headline: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  url: string;
  requiresPlan?: boolean;
  icons?: string[];
  serviceArea?: string[];
  internalLinks?: { label: string; slug: string }[];
  faq?: {
    question: string;
    answer: string;
  }[];
  sections: {
    heading: string;
    paragraph?: string | string[];
    items?: string[];
    image?: { src: string; alt: string };
  }[];
};

export type ServiceSlugProps = Readonly<{
  service: ServiceContent;
  related?: { label: string; slug: string }[];
  remote?: boolean;
}>;

const INLINE_LINK_PATTERN = /\[([^[\]]+)\]\((\/[^)\s]+)\)/g;

const DETAIL_LIST_CLASS = "mt-2 space-y-2";

function renderInlineLinks(text: string): ReactNode {
  const matches = [...text.matchAll(INLINE_LINK_PATTERN)];

  if (matches.length === 0) {
    return text;
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, idx) => {
    const [fullMatch, label, href] = match;
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    nodes.push(
      <Link
        key={`${href}-${idx}-${start}`}
        href={href}
        className="font-medium text-accent underline underline-offset-2 transition hover:text-accent-hover"
      >
        {label}
      </Link>,
    );

    lastIndex = start + fullMatch.length;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function ServiceSlug({ service, related, remote }: ServiceSlugProps) {
  const [first, ...rest] = service.sections;
  const isRemote = remote || false;
  const internalLinks =
    service.internalLinks && service.internalLinks.length > 0
      ? service.internalLinks
      : related;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Services", href: !remote ? "/services" : "/services/remote" },
    { name: service.title },
  ];

  const breadcrumbLd = generateBreadCrumbJsonLd({
    items: crumbs,
    baseUrl: SITE_URL,
  });

  const serviceLd = generateServiceLd({
    name: service.title,
    image: ogImageUrl(service.title),
    keywords: service.keywords,
    description: service.metaDescription || service.description,
    url: `${SITE_URL}${service.url}`,
    areaServed: service.serviceArea,
    provider: { "@type": "Organization", name: "Defend I.T. Solutions" },
    offers: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.description,
        },
      },
    ],
  });

  const faqLd =
    service.faq && service.faq.length > 0
      ? generateFAQPageLd(
          service.faq.map((item) => ({
            name: item.question,
            acceptedAnswer: item.answer,
          })),
        )
      : null;

  const relatedServicesLd =
    internalLinks && internalLinks.length > 0
      ? generateRelatedServiceLd(internalLinks, isRemote)
      : null;

  const hasDYK = Boolean(first?.heading.toLowerCase().includes("did you know"));
  const sections = hasDYK ? rest : service.sections;

  const canonical = `${SITE_URL}${service.url}`;
  const metaTitle =
    service.metaTitle || `${service.title} | Defend I.T. Solutions`;
  const metaDescription = service.metaDescription || service.description;
  const structuredGraph = [
    breadcrumbLd,
    serviceLd,
    localBusinessLd,
    ...(relatedServicesLd ? [relatedServicesLd] : []),
    ...(faqLd ? [faqLd] : []),
  ];

  return (
    <>
      <Meta
        title={metaTitle}
        description={metaDescription}
        imageAlt={`${service.title}, Defend I.T. Solutions`}
        url={canonical}
        canonical={canonical}
        keywords={service.keywords.join(", ")}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": structuredGraph,
        }}
      />

      <PageContainer>
        <div className="max-w-5xl mx-auto w-full py-8 sm:py-10 space-y-6 sm:space-y-7 px-3 sm:px-6 text-left">
          <BreadCrumbs items={crumbs} baseUrl={SITE_URL} />

          <Card
            wash
            className="relative overflow-hidden px-5 py-6 sm:px-6 sm:py-8"
          >
            <DomeGrid className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100%+3rem)] w-full text-accent opacity-55 dark:opacity-100" />

            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-accent bg-surface px-3 py-2 text-eyebrow font-semibold uppercase tracking-eyebrow text-accent sm:px-4">
                {isRemote ? "Remote Service" : "Local Service"}
              </div>

              {service.icons && service.icons.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  {service.icons.map((iconName) => {
                    const name = iconName
                      .split("-")
                      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                      .join("");
                    const LucideIcon = serviceIcon(name);
                    return LucideIcon ? (
                      <div
                        key={iconName}
                        className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-accent bg-surface"
                      >
                        <LucideIcon
                          className="w-6 h-6 text-accent"
                          strokeWidth={1.25}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              <div className="space-y-2">
                <h1 className="text-display tracking-display font-semibold text-ink">
                  {service.title}
                </h1>
                <p className="text-lead text-ink-muted">{service.headline}</p>
              </div>
            </div>
          </Card>

          {hasDYK && (
            <div className="mt-4 rounded-lg border border-border-accent bg-surface p-4 sm:p-5">
              <h2 className="text-h3 tracking-h3 font-semibold text-ink inline-flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-accent" />
                {first!.heading}
              </h2>
              {Array.isArray(first!.paragraph) ? (
                <div className={DETAIL_LIST_CLASS}>
                  {first!.paragraph.map((text) => (
                    <p
                      key={`${first!.heading}-${text}`}
                      className="text-sm sm:text-base text-ink-muted"
                    >
                      {renderInlineLinks(text)}
                    </p>
                  ))}
                </div>
              ) : (
                first!.paragraph && (
                  <p className="mt-2 text-sm sm:text-base text-ink-muted">
                    {renderInlineLinks(first!.paragraph)}
                  </p>
                )
              )}
            </div>
          )}

          {sections.map((section) => (
            <section
              key={`${service.id}-${section.heading}`}
              className="pt-6 sm:pt-8 first:pt-0 border-t border-gray-200/60 dark:border-gray-700/60 first:border-t-0"
            >
              <h2 className="text-xl font-semibold sm:text-2xl">
                {section.heading}
              </h2>

              {section.paragraph &&
                (Array.isArray(section.paragraph) ? (
                  <div className={DETAIL_LIST_CLASS}>
                    {section.paragraph.map((text) => (
                      <p
                        key={`${section.heading}-${text}`}
                        className="text-ink-muted text-sm sm:text-base"
                      >
                        {renderInlineLinks(text)}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-ink-muted text-sm sm:text-base">
                    {renderInlineLinks(section.paragraph)}
                  </p>
                ))}

              {section.items && (
                <ul className="mt-3 list-disc pl-5 sm:pl-6 text-ink-muted text-sm sm:text-base space-y-2 marker:text-accent">
                  {section.items.map((item) => (
                    <li key={`${section.heading}-${item}`}>{renderInlineLinks(item)}</li>
                  ))}
                </ul>
              )}

              {section.image && (
                <figure className="fade-image relative mt-4 aspect-[16/9] w-full overflow-hidden">
                  <ThemedImage
                    dark={section.image.src}
                    alt={section.image.alt}
                    sizes="(min-width: 1024px) 960px, 100vw"
                    className="object-cover"
                  />
                </figure>
              )}
            </section>
          ))}

          {service.faq && service.faq.length > 0 && (
            <FaqSection items={service.faq} />
          )}

          {service.requiresPlan && (
            <div className="mt-6 rounded-lg border border-border-accent bg-surface p-4 sm:p-5 text-ink text-sm flex flex-col items-center">
              <span>
                This service requires an active Remote Support Plan and an enrolled
                device.
              </span>
              <Link
                href="/services/remote/remote-support-plan"
                className="inline-block mt-2 px-3 py-1.5 rounded border border-border-accent bg-surface text-accent font-medium hover:underline transition"
              >
                View Remote Support Plan
              </Link>
            </div>
          )}

          <HowItWorks />

          <div className="mt-10 w-full flex flex-col items-stretch sm:items-center justify-center gap-6 sm:gap-8 text-left sm:text-center">
            <div className="w-full">
              <BookOnline />
            </div>

            {internalLinks && internalLinks.length > 0 && (
              <nav
                aria-label="Related services"
                className="text-sm text-ink-muted max-w-full overflow-x-auto px-0 sm:px-1 mt-2"
              >
                <h3 className="mb-3 text-lg font-semibold text-accent">
                  Related services:
                </h3>
                <ul className="flex flex-wrap items-stretch sm:items-center justify-start sm:justify-center gap-2 max-w-full">
                  {internalLinks.map((r) => (
                    <li key={r.slug} className="w-full sm:w-auto">
                      <Link
                        href={`/services/${
                          isRemote ? `remote/${r.slug}` : r.slug
                        }`}
                        className="w-full sm:w-auto inline-block rounded-lg border border-hairline px-4 py-2 bg-surface text-accent font-medium hover:border-accent transition whitespace-normal text-center"
                      >
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="flex flex-wrap items-stretch sm:items-center justify-start sm:justify-center gap-3 text-sm">
              <Link
                href={isRemote ? "/services/remote" : "/services"}
                className="w-full sm:w-auto inline-block rounded-lg border border-hairline px-4 py-2 bg-surface text-accent font-medium hover:border-accent transition whitespace-normal text-center"
              >
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
