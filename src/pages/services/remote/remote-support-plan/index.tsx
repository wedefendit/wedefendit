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

import { PageContainer, Meta, BreadCrumbs, JsonLdScript } from "@/components";
import { localBusinessLd } from "@/lib/json-ld";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RemoteSupportPlanPage() {
  const faq = [
    {
      q: "Do you require a VPN?",
      a: "No. DISecureLink routes only support traffic with split tunneling. Regular browsing stays on your normal connection.",
    },
    {
      q: "Can you access my devices at any time?",
      a: "Access is consent-based. You choose unattended or on-demand. Permissions are scoped per device.",
    },
    {
      q: "Is my data visible to third parties?",
      a: "Sessions are encrypted. We do not sell or share client data. Access is limited to verified technicians.",
    },
    {
      q: "Can non-local clients enroll?",
      a: "No. Enrollment requires on-site verification in our service area.",
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <Meta
        title="Remote Support Service Plan | Defend I.T. Solutions"
        description="Details about our secure, client-only Remote Support Plan. Learn how DIS Connect™, DISNet™, and DISecureLink™ provide professional remote tech support."
        url="https://www.wedefendit.com/remote-support-plan"
        image="https://www.wedefendit.com/og-image.png"
        keywords="Remote support, secure remote access, local IT support, DISConnect, DISNet, DISecureLink, Defend I.T. Solutions"
      />

      <JsonLdScript jsonLd={localBusinessLd} />
      <JsonLdScript jsonLd={faqLd} />
      <PageContainer>
        {/* Left by default on mobile; larger screens inherit existing look */}
        <main className="max-w-4xl mx-auto py-8 sm:py-10 space-y-6 sm:space-y-7 px-4 sm:px-6 text-left bg-gray-50/10 dark:bg-slate-950/20 rounded-lg shadow-lg">
          <BreadCrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Services", href: "/services" },
              { name: "Remote", href: "/services/remote" },
              {
                name: "Remote Support Plan",
                href: "/services/remote/remote-support-plan",
              },
            ]}
            includeJsonLd={true}
          />
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
              Remote Support Service Plan
            </h1>
            <p className="text-base sm:text-lg w-full text-blue-600 dark:text-sky-400">
              Secure and private remote support for verified local clients.
            </p>
          </div>

          {/* Highlights chips: wrap and left align on mobile */}
          <ul className="mt-2 flex flex-wrap gap-2 sm:gap-3 text-sm text-gray-700 dark:text-gray-300">
            <li className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-900/40">
              Encrypted sessions
            </li>
            <li className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-900/40">
              Consent-based access
            </li>
            <li className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-900/40">
              Local enrollment
            </li>
          </ul>

          {/* Why a plan */}
          <section
            className="pt-6 sm:pt-8 first:pt-0 border-t border-gray-200/60 dark:border-gray-700/60 first:border-t-0"
            aria-labelledby="why-plan"
          >
            <h2 id="why-plan" className="text-2xl font-semibold">
              Why a Support Plan
            </h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              We operate a private remote access environment (DISNet™) with a
              scoped support tunnel (DISecureLink™) and our own remote service
              infrastructure. Access is restricted to enrolled clients and
              managed devices.
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              The plan funds the secure operation of this environment:
              provisioning, monitoring, updates, audits, and capacity reserved
              for clients. Ensuring help is fast, private, and reliable when you
              need it.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              New to our services?{" "}
              <Link
                href="/contact"
                className="text-blue-600 dark:text-sky-400 hover:underline"
              >
                Contact us
              </Link>
              .
            </p>
          </section>

          {/* Technical Approach */}
          <section
            className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60"
            aria-labelledby="tech-approach"
          >
            <h2 id="tech-approach" className="text-2xl font-semibold">
              Technical Approach
            </h2>
            <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-900/40 p-5">
              <ul className="list-disc pl-5 sm:pl-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base space-y-2 marker:text-sky-500 dark:marker:text-sky-400">
                <li>
                  <strong>Private infrastructure:</strong> Remote access
                  services live on our private network and are not exposed to
                  the public internet.
                </li>
                <li>
                  <strong>Scoped access:</strong> The support tunnel is limited
                  to approved service routes; normal browsing stays on your
                  regular connection.
                </li>
                <li>
                  <strong>Layered protection:</strong> Session encryption runs
                  inside the private tunnel for defense in depth.
                </li>
                <li>
                  <strong>Least-privilege control:</strong> Access is
                  consent-based and limited to enrolled devices; enrollment and
                  revocation are handled per device.
                </li>
                <li>
                  <strong>Network isolation:</strong> Segmented zones with
                  default-deny rules; only explicit service paths are allowed.
                </li>
                <li>
                  <strong>Operational hardening:</strong> Ongoing monitoring,
                  maintenance, and updates performed by our team.
                </li>
              </ul>
            </div>
          </section>

          {/* Included */}
          <section
            className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60"
            aria-labelledby="included"
          >
            <h2 id="included" className="text-2xl font-semibold">
              What Is Included
            </h2>
            <ul className="mt-2 list-disc pl-5 sm:pl-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base space-y-2 marker:text-sky-500 dark:marker:text-sky-400">
              <li>Priority scheduling for common issues</li>
              <li>Access control options: unattended or on-demand</li>
              <li>
                Encrypted remote sessions with screen sharing and clipboard
                support
              </li>
              <li>
                DIS Connect™ for launching and managing sessions (not required)
              </li>
              <li>
                Access for up to 14* enrolled devices{" "}
                <Link
                  href="#more-devices"
                  className="text-blue-600 dark:text-sky-400 hover:underline"
                >
                  (see options)
                </Link>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  (subscription members)
                </span>
              </li>
              <li>
                Reduced labor rates for most remote services{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  (subscription members)
                </span>
              </li>
              <li>
                After-hours support for urgent problems{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  (subscription members)
                </span>
              </li>
            </ul>
          </section>

          {/* Eligibility */}
          <section
            className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60"
            aria-labelledby="eligibility"
          >
            <h2 id="eligibility" className="text-2xl font-semibold">
              Who Is Eligible
            </h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Clients in Ocala, Belleview, The Villages, and nearby areas.
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Each device must be enrolled locally. No open enrollment or remote
              setup for non-local clients.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              See our{" "}
              <Link
                href="/awareness"
                className="text-blue-600 dark:text-sky-400 hover:underline"
              >
                security awareness
              </Link>{" "}
              resources.
            </p>
          </section>

          {/* Tiered Support */}
          <section
            className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60"
            aria-labelledby="tiered-support"
          >
            <h2 id="tiered-support" className="text-2xl font-semibold">
              Tiered Support Options
            </h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Our Remote Support Plan is flexible, with tiers based on how you
              prefer to connect:
            </p>
            <ul className="mt-3 list-disc pl-5 sm:pl-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base space-y-2 marker:text-sky-500 dark:marker:text-sky-400">
              <li>
                <strong>Tier&nbsp;1</strong> - Fully asynchronous remote
                support. We can connect without you being present once devices
                are enrolled and permissions are set.
              </li>
              <li>
                <strong>Tier&nbsp;2</strong> - Client initiated support. You
                will be present to start sessions and enter any necessary
                credentials.
              </li>
            </ul>

            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Each tier is available as a subscription or on a pay as you go
              basis.
            </p>

            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Subscription members receive plan benefits like discounted labor
              and after-hours priority. Pay as you go uses standard rates, does
              not include member discounts, and is limited to one device per
              customer.
            </p>
          </section>

          {/* View Remote Services */}
          {/* View Remote Services */}
          <section
            className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60"
            aria-labelledby="view-remote-services"
          >
            <h2 id="view-remote-services" className="text-2xl font-semibold">
              View Remote Services
            </h2>
            <div className="mt-3 rounded-lg border border-sky-300 dark:border-sky-700 bg-sky-50/40 dark:bg-sky-900/20 p-5 text-left sm:text-center">
              <div className="flex items-start gap-3 sm:block">
                <p className="text-sm text-sky-900 dark:text-sky-100">
                  Explore all our remote service offerings for local clients,
                  including troubleshooting, maintenance, and more.
                </p>
              </div>
              <Link
                href="/services/remote"
                className="inline-flex items-center justify-center mt-3 px-4 py-2 rounded-md border border-sky-500 text-sky-700 dark:text-sky-200 bg-transparent hover:bg-sky-50 dark:hover:bg-sky-900/40 font-medium transition"
              >
                View Remote Services
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section
            className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60"
            aria-labelledby="enroll"
          >
            <h2 id="enroll" className="text-2xl font-semibold">
              Ready to Enroll
            </h2>
            <div className="mt-3 rounded-lg bg-blue-600/70 dark:bg-sky-700/40 text-white p-5 text-left sm:text-center shadow-sm">
              <div className="flex items-start gap-3 sm:block">
                <p className="text-sm/6 opacity-95">
                  Initial on-site setup and enrollment are included at no
                  additional cost* when you join the Remote Support Plan.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-block mt-3 px-5 py-3 rounded-md bg-white text-blue-700 dark:text-sky-900 font-semibold hover:bg-slate-100 transition"
              >
                Request Remote Setup
              </Link>
              <p className="mt-2 text-xs opacity-85">
                * Within our local service area.
              </p>
            </div>
          </section>

          {/* More devices */}
          <section
            className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60"
            aria-labelledby="more-devices"
            id="more-devices"
          >
            <h2 className="text-2xl font-semibold">
              Need Coverage for More Devices?
            </h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Our Remote Support Plan includes up to 14 enrolled devices. This
              is plenty for most homes and small offices. If you have a larger
              setup, we can extend coverage with custom device limits and access
              tiers.
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Expanded plans are tailored to your needs, with any additional
              setup or service costs discussed up front, no surprises.
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <Link
                href="/contact"
                className="text-blue-600 dark:text-sky-400 hover:underline"
              >
                Let&apos;s talk about your requirements
              </Link>{" "}
              and design a plan that fits.
            </p>
          </section>

          {/* FAQ */}
          <section
            className="pt-6 sm:pt-8 border-t border-gray-200/60 dark:border-gray-700/60"
            aria-labelledby="faq"
          >
            <h2 id="faq" className="text-2xl font-semibold">
              FAQ
            </h2>
            <div className="mt-2 space-y-2">
              {faq.map(({ q, a }) => (
                <details
                  key={q}
                  className="rounded border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-slate-900/40 p-3 text-black dark:text-gray-200"
                >
                  <summary className="cursor-pointer font-medium w-full">
                    <span className=" text-blue-500 dark:text-sky-400">
                      {q}
                    </span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </main>
      </PageContainer>
    </>
  );
}
