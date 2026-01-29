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
import {
  PageContainer,
  Meta,
  SafetyTipsList,
  ElderlyScamsList,
} from "@/components";
import { generateFAQPageLd, localBusinessLd } from "@/lib/json-ld";
export default function AwarenessPage() {
  const canonical = "https://www.wedefendit.com/awareness";

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
      { "@type": "ListItem", position: 2, name: "Awareness", item: canonical },
    ],
  };

  const awarenessPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cybersecurity Awareness for Seniors | Defend I.T. Solutions",
    url: canonical,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: "https://www.wedefendit.com/og-image.png",
    },
    about: localBusinessLd, // from your json-ld.ts shared definition
  };

  const faqLd = generateFAQPageLd([
    {
      name: "Who is this guide for?",
      acceptedAnswer:
        "Retirees, seniors, caregivers, and community groups in Central Florida. It is written in plain English with practical steps.",
    },
    {
      name: "Do you collect data on this page?",
      acceptedAnswer:
        "No. There is no tracking on this page. It is education only.",
    },
  ]);

  return (
    <>
      <Meta
        title="Cybersecurity Awareness for Seniors | Defend I.T. Solutions"
        description="Practical safety tips and scam prevention guidance for retirees and seniors in Ocala, The Villages, and nearby communities."
        url={canonical}
        image="https://www.wedefendit.com/og-image.png"
        canonical={canonical}
        keywords="cybersecurity for seniors, scam prevention, phishing, Ocala, The Villages, free training"
        structuredData={{
          "@graph": [breadcrumbLd, awarenessPageLd, faqLd],
        }}
      />

      <PageContainer>
        <div className="max-w-5xl mx-auto py-8 sm:py-10 space-y-6 sm:space-y-7 px-4 sm:px-6 text-center sm:text-left bg-gray-50/10 dark:bg-slate-950/20 z-0 rounded-lg shadow-lg">
          {/* Breadcrumbs (match ServiceSlug) */}
          <nav
            aria-label="Breadcrumb"
            className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 overflow-x-auto whitespace-nowrap"
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
              <li className="text-gray-400 dark:text-gray-500 truncate">
                <span aria-current="page">Awareness</span>
              </li>
            </ol>
          </nav>

          {/* Hero */}
          <header className="space-y-4 text-center py-8 px-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-sky-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-sky-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Free Educational Resource
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-sky-400 bg-clip-text text-transparent">
              Cybersecurity Awareness for Seniors
            </h1>
            
            <p className="text-base sm:text-lg text-blue-600 dark:text-sky-400 max-w-2xl mx-auto">
              Simple, Private Guidance To Help You Stay Safe Online.
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              No tracking. No data collection. Just useful information from local experts.
            </p>
          </header>

          {/* Best Practices */}
          <section
            className="pt-6 sm:pt-8 first:pt-0 border-t border-gray-200/60 dark:border-gray-700/60 first:border-t-0 text-center"
            aria-labelledby="best-practices"
          >
            <SafetyTipsList />
          </section>

          {/* Scam Education */}
          <section
            className="pt-6 sm:pt-8 first:pt-0 border-t border-gray-200/60 dark:border-gray-700/60 first:border-t-0 text-center"
            aria-labelledby="top-scams"
          >
            <ElderlyScamsList />
          </section>

          {/* CTA */}
          <section className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 border border-blue-200 dark:border-sky-800 text-center">
              <h2 id="cta" className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Want a Free Group Training?
              </h2>
              <p className="text-md text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                We offer free cybersecurity awareness sessions for community groups, senior centers, clubs, and churches in Central Florida.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Request a Free Training
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Free for groups of 25+. Individual sessions available with small fee.
              </p>
            </div>
          </section>
        </div>
      </PageContainer>
    </>
  );
}
