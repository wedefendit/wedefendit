import Link from "next/link";
import {
  PageContainer,
  Meta,
  SafetyTipsList,
  ElderlyScamsList,
} from "@/components";
import { generateFAQPageLd, localBusinessLd } from "@/lib/json-ld";
import { ogImageUrl, SITE_URL } from "@/lib/og";
import { Card } from "@/components/Card";
import { HeroBanner } from "@/components/HeroBanner";

const SVG_VALUES: Readonly<{ round: "round" }> = { round: "round" };
const GROUP_ELIGIBILITY = "Free for groups of 25 or more. Individual training is available as a paid service.";

export default function AwarenessPage() {
  const canonical = `${SITE_URL}/awareness`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      { "@type": "ListItem", position: 2, name: "Awareness", item: canonical },
    ],
  };

  const awarenessPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Online Safety and Scam Prevention for Seniors | Defend I.T.",
    url: canonical,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: ogImageUrl("Online Safety and Scam Prevention for Seniors"),
    },
    about: localBusinessLd,
  };

  const faqLd = generateFAQPageLd([
    {
      name: "Who is this guide for?",
      acceptedAnswer:
        "Seniors, family members, caregivers, and community groups in Central Florida. The guidance uses plain English and practical steps.",
    },
    {
      name: "Is this guide free?",
      acceptedAnswer:
        "Yes. The guide is free to read and share with family, friends, and community members.",
    },
  ]);

  return (
    <>
      <Meta
        title="Online Safety and Scam Prevention for Seniors | Defend I.T."
        description="Learn how to spot scams, protect online accounts, and browse more safely with plain-English guidance for seniors and families in Central Florida."
        url={canonical}
        canonical={canonical}
        keywords="online safety for seniors, scam prevention Ocala FL, cybersecurity awareness The Villages, phishing prevention, senior technology training Central Florida"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [breadcrumbLd, awarenessPageLd, faqLd],
        }}
      />

      <PageContainer>
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="text-xs sm:text-sm text-ink-dim overflow-x-auto whitespace-nowrap"
          >
            <ol className="flex items-center gap-1 sm:gap-2">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="px-1 sm:px-2">
                ›
              </li>
              <li className="text-ink-muted truncate">
                <span aria-current="page">Awareness</span>
              </li>
            </ol>
          </nav>
        </div>

        <HeroBanner
          dark="/img/locations/the-villages-hero-dark.jpg"
          light="/img/locations/the-villages-hero-light.jpg"
          alt="A Central Florida home with its devices protected under a security shield"
          position="object-[center_90%]"
        >
          <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
            Free Cybersecurity Guide
          </p>
          <h1 className="mt-4 text-balance text-display tracking-display font-semibold text-ink">
            Online Safety and Scam Prevention for Seniors and Families
          </h1>
          <p className="mt-5 max-w-lg text-lead text-ink-muted">
            Learn how to recognize common scams, protect important accounts, and
            make safer choices online.
          </p>
        </HeroBanner>

        <div className="max-w-5xl mx-auto w-full py-8 sm:py-10 space-y-6 sm:space-y-7 px-3 sm:px-6 text-center sm:text-left">
          <section
            className="pt-6 sm:pt-8 first:pt-0 border-t border-hairline first:border-t-0 text-center"
            aria-labelledby="best-practices"
          >
            <SafetyTipsList />
          </section>

          <section
            className="pt-6 sm:pt-8 first:pt-0 border-t border-hairline first:border-t-0 text-center"
            aria-labelledby="top-scams"
          >
            <ElderlyScamsList />
          </section>

          <section className="pt-6 sm:pt-8 border-t border-hairline">
            <Card wash className="relative overflow-hidden p-8 text-center">
              <div className="relative">
                <h2
                  id="cta"
                  className="text-h2 tracking-h2 font-semibold mb-4 text-ink"
                >
                  Request Free Group Training
                </h2>
                <p className="text-md text-ink-muted mb-6 max-w-2xl mx-auto">
                  Free cybersecurity awareness sessions are available for senior
                  centers, churches, clubs, and community groups across Central
                  Florida.
                </p>
                <p className="text-sm text-ink-muted mb-6 max-w-2xl mx-auto">
                  Each session uses plain English, practical examples, and time
                  for questions.
                </p>
                <Link
                  href="/contact"
                  style={{ touchAction: "manipulation" }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-fill text-accent-contrast font-semibold transition-all shadow-lg hover:bg-accent-fill-hover hover:shadow-xl touch-manipulation"
                >
                  Request Group Training
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap={SVG_VALUES.round}
                      strokeLinejoin={SVG_VALUES.round}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <p className="mt-4 text-sm text-ink-muted">
                  {GROUP_ELIGIBILITY}
                </p>
              </div>
            </Card>
          </section>
        </div>
      </PageContainer>
    </>
  );
}
