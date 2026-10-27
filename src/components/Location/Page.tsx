import Link from "next/link";
import { ThemedImage } from "@/components/ThemedImage";
import { ArrowRight } from "lucide-react";
import { Meta, PageContainer, BreadCrumbs, FaqSection } from "@/components";
import { Card } from "@/components/Card";
import { HeroBanner } from "@/components/HeroBanner";
import { HowItWorks } from "@/components/HowItWorks";
import {
  generateBreadCrumbJsonLd,
  generateFAQPageLd,
  generateLocalBusinessLd,
  generateServiceLd,
} from "@/lib/json-ld";
import type { LocationContent } from "@/lib/location-page";
import { ogImageUrl, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/og";

const OG_CARD_SLUGS: ReadonlySet<string> = new Set([
  "ocala",
  "belleview",
  "the-villages",
]);

const FIGURE = "fade-image relative w-full overflow-hidden";
const IMG_SIZES = "(min-width: 1024px) 960px, 100vw";
const PROVIDER: Readonly<{ "@type": "Organization"; name: string }> = { "@type": "Organization", name: "Defend I.T. Solutions" };
const SECTION = "pt-6 sm:pt-8 border-t border-hairline";
const TOUCH: Readonly<{ touchAction: "manipulation" }> = { touchAction: "manipulation" };
const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-accent-fill px-6 py-3 font-semibold text-accent-contrast shadow-card transition hover:bg-accent-fill-hover hover:shadow-card-hover touch-manipulation";
const SECONDARY_BTN =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-hairline px-6 py-3 font-semibold text-ink transition hover:border-border-accent hover:text-accent touch-manipulation";
const SERVICE_LINK =
  "flex h-full flex-col gap-1 rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] p-4 transition hover:border-border-accent touch-manipulation";
const BODY_TEXT = "text-ink-muted text-sm sm:text-base leading-relaxed";
const SECTION_TITLE = "text-h2 tracking-h2 font-semibold text-ink";
const ITEM_GRID = "mt-5 grid list-none gap-3 p-0 sm:grid-cols-2";
const ITEM_SUMMARY = "text-sm leading-relaxed text-ink-muted";
const WIDE_FIGURE = `${FIGURE} mt-4 aspect-[16/9]`;
const LOCATION_SECTION_ID = { services: "local-services", reviews: "local-reviews" };

type LocationPageProps = Readonly<{ location: LocationContent }>;

export function LocationPage({ location }: LocationPageProps) {
  const canonical = `${SITE_URL}/service-areas/${location.slug}`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Service Areas", href: "/service-areas" },
    { name: location.city },
  ];

  const ogImage = OG_CARD_SLUGS.has(location.slug)
    ? ogImageUrl(`og-${location.slug}`)
    : DEFAULT_OG_IMAGE;
  const hasBanner = Boolean(location.banner);
  const breadcrumbLd = generateBreadCrumbJsonLd({ items: crumbs, baseUrl: SITE_URL });
  const businessLd = generateLocalBusinessLd(location.areaServed, ogImage);
  const serviceLds = location.services.map((svc) =>
    generateServiceLd({
      name: `${svc.label} in ${location.city}, ${location.state}`,
      description: svc.summary,
      url: `${SITE_URL}/services/${svc.slug}`,
      image: ogImage,
      areaServed: location.areaServed,
      provider: PROVIDER,
    }),
  );
  const faqLd = generateFAQPageLd(
    location.faq.map((item) => ({ name: item.question, acceptedAnswer: item.answer })),
  );

  const structuredGraph = [breadcrumbLd, businessLd, ...serviceLds, faqLd];

  return (
    <>
      <Meta
        title={location.metaTitle}
        description={location.metaDescription}
        image={ogImage}
        url={canonical}
        canonical={canonical}
        keywords={location.keywords.join(", ")}
        structuredData={{ "@context": "https://schema.org", "@graph": structuredGraph }}
      />

      <PageContainer>
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
          <BreadCrumbs items={crumbs} baseUrl={SITE_URL} />
        </div>

        {location.heroImage ? (
          <HeroBanner
            dark={location.heroImage.src}
            light={location.heroImage.src.replace("-dark.", "-light.")}
            alt={location.heroImage.alt}
            position={
              location.heroImage.src.includes("the-villages")
                ? "object-[center_90%]"
                : "object-bottom"
            }
          >
            <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
              {location.eyebrow}
            </p>
            <h1 className="mt-4 text-balance text-display tracking-display font-semibold text-ink">
              {location.h1}
            </h1>
            <p className="mt-5 max-w-lg text-lead text-ink-muted">
              {location.headline}
            </p>
          </HeroBanner>
        ) : (
          <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6">
            <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
              {location.eyebrow}
            </p>
            <h1 className="mt-4 text-balance text-display tracking-display font-semibold text-ink">
              {location.h1}
            </h1>
            <p className="mt-5 max-w-readable text-lead text-ink-muted">
              {location.headline}
            </p>
          </div>
        )}

        <div className="max-w-5xl mx-auto w-full py-8 sm:py-10 space-y-6 sm:space-y-7 px-3 sm:px-6 text-left">

          <section className="space-y-3">
            {location.intro.map((paragraph) => (
              <p key={paragraph} className={BODY_TEXT}>
                {paragraph}
              </p>
            ))}
          </section>

          {location.sections.map((section) => {
            // The "how it works" section uses the shared component (illustration
            // + numbered steps) for consistency with the rest of the site,
            // instead of dumping the bare image like the other JSON sections.
            if (section.image?.src.includes("how-it-works")) {
              return (
                <div key={section.heading} className={SECTION}>
                  <HowItWorks />
                </div>
              );
            }

            return (
            <section key={section.heading} className={SECTION}>
              <h2 className={SECTION_TITLE}>{section.heading}</h2>

              {section.paragraph && (
                <div className="mt-3 space-y-2">
                  {section.paragraph.map((paragraph) => (
                    <p
                      key={paragraph}
                      className={BODY_TEXT}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {section.items && (
                <ul className="mt-3 list-disc pl-5 sm:pl-6 text-ink-muted text-sm sm:text-base space-y-2 marker:text-accent">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}

              {section.image && (
                <figure className={WIDE_FIGURE}>
                  <ThemedImage
                    dark={section.image.src}
                    alt={section.image.alt}
                    sizes={IMG_SIZES}
                    className="object-cover"
                  />
                </figure>
              )}
            </section>
            );
          })}

          <section className={SECTION} aria-labelledby={LOCATION_SECTION_ID.services}>
            <h2 id={LOCATION_SECTION_ID.services} className={SECTION_TITLE}>
              Services Available in {location.city}
            </h2>
            <ul className={ITEM_GRID}>
              {location.services.map((svc) => (
                <li key={svc.slug}>
                  <Link href={`/services/${svc.slug}`} className={SERVICE_LINK} style={TOUCH}>
                    <span className="font-semibold text-ink">{svc.label}</span>
                    <span className={ITEM_SUMMARY}>{svc.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {location.testimonials.length > 0 && (
            <section className={SECTION} aria-labelledby={LOCATION_SECTION_ID.reviews}>
              <h2 id={LOCATION_SECTION_ID.reviews} className={SECTION_TITLE}>
                What neighbors say
              </h2>
              <ul className={ITEM_GRID}>
                {location.testimonials.map((testimonial) => (
                  <li key={testimonial.quote}>
                    <Card wash className="h-full p-4">
                      <blockquote className={ITEM_SUMMARY}>
                        {testimonial.quote}
                      </blockquote>
                      <p className="mt-2 text-sm font-semibold text-ink">
                        {testimonial.attribution}
                      </p>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <FaqSection items={location.faq} />

          <Card
            as="section"
            wash={!hasBanner}
            className={`relative isolate overflow-hidden ${
              hasBanner
                ? "flex items-center p-6 sm:min-h-[16rem] sm:p-10 lg:p-12"
                : "p-6 text-center sm:p-10"
            }`}
          >
            {location.banner && (
              <>
                <ThemedImage
                  dark={location.banner.src}
                  alt=""
                  sizes={IMG_SIZES}
                  className="-z-10 object-cover object-right"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-ground via-ground/80 to-ground/30 sm:via-ground/60 sm:to-transparent"
                />
              </>
            )}
            <div className={hasBanner ? "relative max-w-md text-left" : "relative"}>
              <h2 className={`${SECTION_TITLE} text-balance`}>
                Get Local Tech Help in {location.city}
              </h2>
              <p
                className={`mt-4 max-w-readable text-ink-muted ${
                  hasBanner ? "" : "mx-auto"
                }`}
              >
                Call, text, or book online. We provide on-site service and arranged pickup
                and drop-off. Enrolled clients can also request remote support.
              </p>
              <div
                className={`mt-8 flex flex-col gap-3 sm:flex-row ${
                  hasBanner
                    ? "items-start sm:items-center"
                    : "items-center justify-center"
                }`}
              >
                <Link href={location.cta.link} className={PRIMARY_BTN} style={TOUCH}>
                  {location.cta.label}
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link href="/awareness" className={SECONDARY_BTN} style={TOUCH}>
                  View Online Safety Tips
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}

export default LocationPage;
