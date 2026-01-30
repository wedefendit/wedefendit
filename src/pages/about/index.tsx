/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/
import Link from "next/link";
import { localBusinessLd } from "@/lib/json-ld";
import type { ComponentType, SVGProps } from "react";
import { ShieldCheck, MapPin, MessageCircle } from "lucide-react";
import { PageContainer, Meta, BookOnline, BreadCrumbs } from "@/components";

const valueData = [
  {
    title: "Security First",
    description:
      "Your data and privacy are our top priority. We implement modern protections tailored to your environment.",
    icon: ShieldCheck,
  },
  {
    title: "Local & Personal",
    description:
      "No call centers or bots. Just real humans helping real people, in person across Ocala, Belleview, and The Villages.",
    icon: MapPin,
  },
  {
    title: "Clear, Honest Support",
    description:
      "No tech-speak walls. We explain things in plain English and only recommend what you actually need.",
    icon: MessageCircle,
  },
] as const;

type ValueItemProps = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function ValueItem({ title, description, Icon }: ValueItemProps) {
  return (
    <article className="flex flex-col p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-sky-400/20 hover:border-blue-500 dark:hover:border-sky-400 transition-all duration-300">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
          <Icon
            className="w-7 h-7 text-blue-600 dark:text-sky-400"
            aria-hidden="true"
          />
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </article>
  );
}

function RenderValues() {
  return (
    <div className="grid gap-6 md:grid-cols-1" role="list">
      {valueData.map((item) => (
        <div key={item.title}>
          <ValueItem
            title={item.title}
            description={item.description}
            Icon={item.icon}
          />
        </div>
      ))}
    </div>
  );
}

export default function About() {
  const canonical = "https://www.wedefendit.com/about";

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.wedefendit.com/",
      },
      { "@type": "ListItem", position: 2, name: "About", item: canonical },
    ],
  };

  const aboutPageLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Defend I.T. Solutions",
    url: canonical,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: "https://www.wedefendit.com/og-image.png",
    },
    about: {
      ...localBusinessLd,
      sameAs: [
        "https://www.google.com/search?q=Defend+I.T.+Solutions+Ocala",
        "https://www.facebook.com/",
      ],
      hasMap:
        "https://www.google.com/maps/search/?api=1&query=Defend+I.T.+Solutions+Ocala+FL",
    },
  };

  return (
    <>
      <Meta
        title="About Defend I.T. Solutions | Cybersecurity & IT Support in Ocala, Belleview & The Villages"
        description="Learn about Defend I.T. Solutions, a local cybersecurity and IT support company serving Ocala, Belleview, The Villages, and surrounding Central Florida communities with privacy-first, on-site tech support."
        image="https://www.wedefendit.com/og-image.png"
        url={canonical}
        canonical={canonical}
        keywords="Defend I.T. Solutions, cybersecurity Ocala FL, IT support Belleview FL, IT support The Villages FL, local tech support Central Florida, privacy-focused IT services"
        structuredData={{ "@graph": [breadcrumbLd, aboutPageLd] }}
      />

      <PageContainer>
        <div className="max-w-3xl mx-auto p-4 space-y-10 rounded bg-gray-50/10 dark:bg-slate-950/20 shadow-sm">
          <BreadCrumbs
            includeJsonLd={false}
            items={[{ name: "Home", href: "/" }, { name: "About" }]}
          />

          {/* Hero Section */}
          <header className="text-center space-y-4 py-8 px-4 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-blue-200 dark:border-sky-800 shadow-sm">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-sky-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-sky-300">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Locally Owned & Operated
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              About Defend I.T. Solutions
            </h1>

            <p className="mt-3 text-lg text-blue-600 dark:text-sky-400 max-w-2xl mx-auto">
              Local cybersecurity and IT support serving Ocala, Belleview, The
              Villages, and surrounding Central Florida.
            </p>
          </header>

          <section
            aria-labelledby="who-we-are"
            className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700"
          >
            <p className="text-lg text-gray-900 dark:text-white">
              <strong className="text-blue-600 dark:text-sky-400">
                Defend I.T. Solutions
              </strong>{" "}
              is a locally owned cybersecurity and tech support company based in
              Ocala, Florida, providing in-home, on-site, and remote IT services
              across Ocala, Belleview, The Villages, and nearby Central Florida
              communities.
            </p>

            <p className="text-lg mt-4 text-gray-700 dark:text-gray-300">
              We believe technology should work for you, not against you, and we
              focus on secure networks, scam prevention, malware cleanup, and
              clear, honest guidance without upsells or scare tactics.
            </p>
          </section>

          <section aria-labelledby="core-values">
            <h2
              id="core-values"
              className="text-2xl md:text-3xl font-semibold mb-4"
            >
              Our Core Values
            </h2>
            <RenderValues />
          </section>

          <section
            aria-labelledby="why-different"
            className="bg-white dark:bg-slate-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <h2
              id="why-different"
              className="text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-sky-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-sky-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              Why We&apos;re Different
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              From securing smart homes to cleaning infected systems, we deliver
              practical, local solutions backed by real cybersecurity
              experience—not scripts or call centers.
            </p>
          </section>

          {/* Services CTA */}
          <section className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 border border-blue-200 dark:border-sky-800 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Explore Our Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              From computer repair to network security, we offer comprehensive
              IT solutions tailored to your needs.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              View All Services
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </section>

          <BookOnline />
        </div>
      </PageContainer>
    </>
  );
}
