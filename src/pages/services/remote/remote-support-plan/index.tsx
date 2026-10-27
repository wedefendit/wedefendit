import {
  PageContainer,
  Meta,
  BreadCrumbs,
  JsonLdScript,
  FaqSection,
} from "@/components";
import { generateFAQPageLd, localBusinessLd } from "@/lib/json-ld";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SITE_URL } from "@/lib/og";

const CANONICAL = `${SITE_URL}/services/remote/remote-support-plan`;
const SUPPORT_PATH = { remote: "/services/remote", contact: "/contact" };
const SUPPORT_SECTION_ID = { why: "why-plan", approach: "tech-approach", included: "included", eligibility: "eligibility", tiers: "tiered-support", services: "view-remote-services", enroll: "enroll", devices: "more-devices" };
const SVG_VALUE: Readonly<{ fill: "none"; stroke: "currentColor"; viewBox: "0 0 24 24"; round: "round" }> = { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", round: "round" };
const TOUCH: Readonly<{ touchAction: "manipulation" }> = { touchAction: "manipulation" };
const SUPPORT_CLASS = {
  icon: "w-5 h-5 text-accent",
  featureLabel: "text-sm font-medium text-ink",
  sectionTitle: "text-h2 tracking-h2 font-semibold text-ink",
  sectionTitleSpaced: "text-h2 tracking-h2 font-semibold text-ink mb-4",
  sectionText: "mt-2 text-ink-muted",
  section: "pt-6 sm:pt-8 border-t border-hairline",
  protectedItem: "flex items-start gap-3",
  protectedTitle: "font-semibold text-ink mb-1",
  protectedText: "text-sm text-ink-muted",
  tierHeader: "flex items-center gap-3 mb-4",
  tierTitle: "text-h3 tracking-h3 font-semibold text-ink",
  tierLead: "text-ink-muted mb-4",
  tierBody: "text-sm text-ink-muted leading-relaxed",
  tierFooter: "mt-6 pt-4 border-t border-hairline",
  relative: "relative",
  actionIcon: "w-5 h-5",
};
const DEVICE_LIMIT_COPY = "The standard Remote Support Plan covers up to 14 enrolled devices. If you need more, we can define custom device limits and access options.";

export default function RemoteSupportPlanPage() {
  const faq = [
    {
      question: "Do you require a VPN?",
      answer:
        "No. DISecureLink uses split tunneling, so only approved support traffic enters the support network. Normal browsing stays on your regular connection.",
    },
    {
      question: "Can you access my devices at any time?",
      answer:
        "That depends on the selected access option. Client-initiated access starts when you request a session. Unattended access is limited to enrolled devices that you authorize and can be revoked.",
    },
    {
      question: "Is my data visible to third parties?",
      answer:
        "Remote sessions are encrypted and limited to authorized technicians. We do not sell or share client data.",
    },
    {
      question: "Can non-local clients enroll?",
      answer:
        "No. Enrollment requires an in-person setup visit within our Central Florida service area.",
    },
  ];

  const faqLd = generateFAQPageLd(
    faq.map(({ question, answer }) => ({
      name: question,
      acceptedAnswer: answer,
    })),
  );

  return (
    <>
      <Meta
        title="Remote Support Plan for Central Florida | Defend I.T. Solutions"
        description="Secure remote tech support for verified local clients in Ocala, Belleview, and The Villages. Compare access options, enrollment requirements, and included services."
        url={CANONICAL}
        keywords="Remote Support Plan, secure remote tech support, remote computer help, Ocala, Belleview, The Villages, DISecureLink"
      />

      <JsonLdScript jsonLd={localBusinessLd} />
      <JsonLdScript jsonLd={faqLd} />
      <PageContainer>
        <main className="max-w-5xl mx-auto py-8 sm:py-10 space-y-6 sm:space-y-7 px-4 sm:px-6 text-left">
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

          <div className="relative overflow-hidden rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] px-6 py-8 shadow-card space-y-4">
            <div className="relative inline-flex items-center gap-2 rounded-full border border-border-accent bg-surface px-4 py-2 text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
              <svg
                aria-hidden
                className="w-4 h-4"
                fill={SVG_VALUE.fill}
                stroke={SVG_VALUE.stroke}
                strokeWidth={1.25}
                viewBox={SVG_VALUE.viewBox}
              >
                <path
                  strokeLinecap={SVG_VALUE.round}
                  strokeLinejoin={SVG_VALUE.round}
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Available to Verified Local Clients
            </div>

            <h1 className="relative text-display tracking-display font-semibold text-ink">
              Remote Support Plan
            </h1>

            <p className="relative max-w-readable text-lead text-ink-muted">
              Get secure follow-up support on enrolled devices after an in-person
              setup visit. Choose client-initiated or authorized unattended
              access.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="relative flex items-center gap-3 overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-card">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border-accent bg-surface">
                  <svg
                    aria-hidden
                    className={SUPPORT_CLASS.icon}
                    fill={SVG_VALUE.fill}
                    stroke={SVG_VALUE.stroke}
                    viewBox={SVG_VALUE.viewBox}
                  >
                    <path
                      strokeLinecap={SVG_VALUE.round}
                      strokeLinejoin={SVG_VALUE.round}
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <span className={SUPPORT_CLASS.featureLabel}>
                  Encrypted Remote Sessions
                </span>
              </div>

              <div className="relative flex items-center gap-3 overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-card">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border-accent bg-surface">
                  <svg
                    aria-hidden
                    className={SUPPORT_CLASS.icon}
                    fill={SVG_VALUE.fill}
                    stroke={SVG_VALUE.stroke}
                    viewBox={SVG_VALUE.viewBox}
                  >
                    <path
                      strokeLinecap={SVG_VALUE.round}
                      strokeLinejoin={SVG_VALUE.round}
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className={SUPPORT_CLASS.featureLabel}>
                  Access You Control
                </span>
              </div>

              <div className="relative flex items-center gap-3 overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-card">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border-accent bg-surface">
                  <svg
                    aria-hidden
                    className={SUPPORT_CLASS.icon}
                    fill={SVG_VALUE.fill}
                    stroke={SVG_VALUE.stroke}
                    viewBox={SVG_VALUE.viewBox}
                  >
                    <path
                      strokeLinecap={SVG_VALUE.round}
                      strokeLinejoin={SVG_VALUE.round}
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap={SVG_VALUE.round}
                      strokeLinejoin={SVG_VALUE.round}
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className={SUPPORT_CLASS.featureLabel}>
                  In-Person Enrollment
                </span>
              </div>
            </div>
          </div>

          <section
            className="pt-6 sm:pt-8 first:pt-0 border-t border-hairline first:border-t-0"
            aria-labelledby={SUPPORT_SECTION_ID.why}
          >
            <h2
              id={SUPPORT_SECTION_ID.why}
              className={SUPPORT_CLASS.sectionTitle}
            >
              Why Use a Support Plan
            </h2>
            <p className={SUPPORT_CLASS.sectionText}>
              Remote access needs a secure connection, an enrolled device, and clear
              permissions. The plan provides that foundation so approved
              follow-up work can happen without another on-site visit.
            </p>
            <p className={SUPPORT_CLASS.sectionText}>
              Plan fees cover device enrollment, secure access infrastructure,
              maintenance, and support capacity reserved for plan clients.
            </p>
          </section>

          <section
            className={SUPPORT_CLASS.section}
            aria-labelledby={SUPPORT_SECTION_ID.approach}
          >
            <h2
              id={SUPPORT_SECTION_ID.approach}
              className={SUPPORT_CLASS.sectionTitle}
            >
              How Remote Access Is Protected
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
                <div className={SUPPORT_CLASS.protectedItem}>
                  <div className="w-10 h-10 rounded-full bg-surface border border-border-accent flex items-center justify-center flex-shrink-0">
                    <svg
                      aria-hidden
                      className={SUPPORT_CLASS.icon}
                      fill={SVG_VALUE.fill}
                      stroke={SVG_VALUE.stroke}
                      viewBox={SVG_VALUE.viewBox}
                    >
                      <path
                        strokeLinecap={SVG_VALUE.round}
                        strokeLinejoin={SVG_VALUE.round}
                        strokeWidth={2}
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className={SUPPORT_CLASS.protectedTitle}>
                      Private Infrastructure
                    </h3>
                    <p className={SUPPORT_CLASS.protectedText}>
                      Remote support services run on private company infrastructure and are
                      not open directly to the public internet.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
                <div className={SUPPORT_CLASS.protectedItem}>
                  <div className="w-10 h-10 rounded-full bg-surface border border-border-accent flex items-center justify-center flex-shrink-0">
                    <svg
                      aria-hidden
                      className={SUPPORT_CLASS.icon}
                      fill={SVG_VALUE.fill}
                      stroke={SVG_VALUE.stroke}
                      viewBox={SVG_VALUE.viewBox}
                    >
                      <path
                        strokeLinecap={SVG_VALUE.round}
                        strokeLinejoin={SVG_VALUE.round}
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className={SUPPORT_CLASS.protectedTitle}>
                      Scoped Access
                    </h3>
                    <p className={SUPPORT_CLASS.protectedText}>
                      DISecureLink routes only approved support traffic. Normal browsing
                      stays on your regular connection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
                <div className={SUPPORT_CLASS.protectedItem}>
                  <div className="w-10 h-10 rounded-full bg-surface border border-border-accent flex items-center justify-center flex-shrink-0">
                    <svg
                      aria-hidden
                      className={SUPPORT_CLASS.icon}
                      fill={SVG_VALUE.fill}
                      stroke={SVG_VALUE.stroke}
                      viewBox={SVG_VALUE.viewBox}
                    >
                      <path
                        strokeLinecap={SVG_VALUE.round}
                        strokeLinejoin={SVG_VALUE.round}
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className={SUPPORT_CLASS.protectedTitle}>
                      Layered Protection
                    </h3>
                    <p className={SUPPORT_CLASS.protectedText}>
                      Remote sessions are encrypted inside the private support
                      connection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
                <div className={SUPPORT_CLASS.protectedItem}>
                  <div className="w-10 h-10 rounded-full bg-surface border border-border-accent flex items-center justify-center flex-shrink-0">
                    <svg
                      aria-hidden
                      className={SUPPORT_CLASS.icon}
                      fill={SVG_VALUE.fill}
                      stroke={SVG_VALUE.stroke}
                      viewBox={SVG_VALUE.viewBox}
                    >
                      <path
                        strokeLinecap={SVG_VALUE.round}
                        strokeLinejoin={SVG_VALUE.round}
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className={SUPPORT_CLASS.protectedTitle}>
                      Device-Level Access Control
                    </h3>
                    <p className={SUPPORT_CLASS.protectedText}>
                      Access is limited to enrolled devices and the permissions selected for
                      each device. Authorization can be revoked.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
                <div className={SUPPORT_CLASS.protectedItem}>
                  <div className="w-10 h-10 rounded-full bg-surface border border-border-accent flex items-center justify-center flex-shrink-0">
                    <svg
                      aria-hidden
                      className={SUPPORT_CLASS.icon}
                      fill={SVG_VALUE.fill}
                      stroke={SVG_VALUE.stroke}
                      viewBox={SVG_VALUE.viewBox}
                    >
                      <path
                        strokeLinecap={SVG_VALUE.round}
                        strokeLinejoin={SVG_VALUE.round}
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className={SUPPORT_CLASS.protectedTitle}>
                      Restricted Network Paths
                    </h3>
                    <p className={SUPPORT_CLASS.protectedText}>
                      Default-deny network rules block traffic except for approved support
                      services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
                <div className={SUPPORT_CLASS.protectedItem}>
                  <div className="w-10 h-10 rounded-full bg-surface border border-border-accent flex items-center justify-center flex-shrink-0">
                    <svg
                      aria-hidden
                      className={SUPPORT_CLASS.icon}
                      fill={SVG_VALUE.fill}
                      stroke={SVG_VALUE.stroke}
                      viewBox={SVG_VALUE.viewBox}
                    >
                      <path
                        strokeLinecap={SVG_VALUE.round}
                        strokeLinejoin={SVG_VALUE.round}
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap={SVG_VALUE.round}
                        strokeLinejoin={SVG_VALUE.round}
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className={SUPPORT_CLASS.protectedTitle}>
                      Maintained Systems
                    </h3>
                    <p className={SUPPORT_CLASS.protectedText}>
                      We monitor, patch, and maintain the systems used to provide remote
                      support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={SUPPORT_CLASS.section}
            aria-labelledby={SUPPORT_SECTION_ID.included}
          >
            <h2
              id={SUPPORT_SECTION_ID.included}
              className={SUPPORT_CLASS.sectionTitle}
            >
              What Is Included
            </h2>
            <ul className="mt-2 list-disc pl-5 sm:pl-6 text-ink-muted text-sm sm:text-base space-y-2 marker:text-accent">
              <li>Priority scheduling for supported remote issues</li>
              <li>Encrypted remote sessions under the selected access option</li>
              <li>
                Client-initiated or authorized unattended support, depending on the plan
              </li>
              <li>Enrollment and secure setup for approved devices</li>
              <li>Reduced remote labor rates for subscription members</li>
              <li>After-hours support for urgent issues when available</li>
            </ul>
          </section>

          <section
            className={SUPPORT_CLASS.section}
            aria-labelledby={SUPPORT_SECTION_ID.eligibility}
          >
            <h2
              id={SUPPORT_SECTION_ID.eligibility}
              className={SUPPORT_CLASS.sectionTitle}
            >
              Who Is Eligible
            </h2>
            <p className={SUPPORT_CLASS.sectionText}>
              This plan is available to clients in Ocala, Belleview, The Villages,
              and nearby communities. Enrollment includes in-person client and
              device verification before remote support is available.
            </p>
          </section>

          <section
            className={SUPPORT_CLASS.section}
            aria-labelledby={SUPPORT_SECTION_ID.tiers}
          >
            <h2
              id={SUPPORT_SECTION_ID.tiers}
              className={SUPPORT_CLASS.sectionTitleSpaced}
            >
              Remote Access Options
            </h2>
            <p className="mt-2 text-ink-muted mb-6">
              Choose how remote sessions can start on each enrolled device:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
                <div className={SUPPORT_CLASS.tierHeader}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border-accent bg-surface text-xl font-bold text-accent">
                    1
                  </div>
                  <h3 className={SUPPORT_CLASS.tierTitle}>
                    Tier 1
                  </h3>
                </div>
                <p className={SUPPORT_CLASS.tierLead}>
                  <strong>Authorized Unattended Access</strong>
                </p>
                <p className={SUPPORT_CLASS.tierBody}>
                  After enrollment and authorization, we can connect without you
                  starting each session. This option fits scheduled
                  maintenance, updates, and approved non-urgent work.
                </p>
                <div className={SUPPORT_CLASS.tierFooter}>
                  <p className={SUPPORT_CLASS.protectedText}>
                    ✓ Authorized unattended access
                    <br />
                    ✓ Scheduled or after-hours work when available
                    <br />✓ Automated maintenance when included
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
                <div className={SUPPORT_CLASS.tierHeader}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border-accent bg-surface text-xl font-bold text-accent">
                    2
                  </div>
                  <h3 className={SUPPORT_CLASS.tierTitle}>
                    Tier 2
                  </h3>
                </div>
                <p className={SUPPORT_CLASS.tierLead}>
                  <strong>Client-Initiated Access</strong>
                </p>
                <p className={SUPPORT_CLASS.tierBody}>
                  You start each session and remain available to enter credentials or
                  answer questions. This option fits live troubleshooting and
                  guided support.
                </p>
                <div className={SUPPORT_CLASS.tierFooter}>
                  <p className={SUPPORT_CLASS.protectedText}>
                    ✓ You start each session
                    <br />
                    ✓ Credentials stay with you
                    <br />✓ Live interaction
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card">
              <p className="text-ink-muted text-sm">
                <strong>Both access options are available as:</strong> Subscription
                plans include member rates and priority benefits. Pay-As-You-Go
                uses standard rates, covers one enrolled device, and does not
                include member discounts.
              </p>
            </div>
          </section>

          <section
            className={SUPPORT_CLASS.section}
            aria-labelledby={SUPPORT_SECTION_ID.services}
          >
            <h2
              id={SUPPORT_SECTION_ID.services}
              className={SUPPORT_CLASS.sectionTitleSpaced}
            >
              View Remote Services
            </h2>
            <div className="relative mt-3 overflow-hidden rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] p-6 text-center shadow-card">
              <div className={SUPPORT_CLASS.relative}>
                <p className="text-ink mb-4">
                  Enrolled clients can use remote sessions for software
                  troubleshooting, malware cleanup, security assessments, and
                  privacy settings. Training and tutoring are booked separately
                  and do not require the plan.
                </p>
                <Link
                  href={SUPPORT_PATH.remote}
                  style={TOUCH}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-fill text-accent-contrast font-semibold transition-all shadow-md hover:bg-accent-fill-hover hover:shadow-lg touch-manipulation"
                >
                  View Remote Services
                  <ArrowRight className={SUPPORT_CLASS.actionIcon} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          <section
            className={SUPPORT_CLASS.section}
            aria-labelledby={SUPPORT_SECTION_ID.enroll}
          >
            <h2
              id={SUPPORT_SECTION_ID.enroll}
              className={SUPPORT_CLASS.sectionTitleSpaced}
            >
              Enroll in the Remote Support Plan
            </h2>
            <div className="relative mt-3 overflow-hidden rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] p-8 text-center shadow-card">
              <div className={SUPPORT_CLASS.relative}>
                <p className="text-lg mb-2 font-semibold text-ink">
                  Start with an In-Person Setup
                </p>
                <p className="text-sm mb-6 max-w-2xl mx-auto text-ink-muted">
                  We verify the client, enroll approved devices, and configure the
                  selected access option during a local setup visit.
                </p>
                <Link
                  href={SUPPORT_PATH.contact}
                  style={TOUCH}
                  className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-6 py-3 text-accent font-semibold shadow-card transition hover:-translate-y-0.5 hover:border-accent touch-manipulation"
                >
                  Request Plan Enrollment
                  <svg
                    aria-hidden
                    className={SUPPORT_CLASS.actionIcon}
                    fill={SVG_VALUE.fill}
                    stroke={SVG_VALUE.stroke}
                    viewBox={SVG_VALUE.viewBox}
                  >
                    <path
                      strokeLinecap={SVG_VALUE.round}
                      strokeLinejoin={SVG_VALUE.round}
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <p className="mt-4 text-xs text-ink-muted">
                  Available within our local service area: Ocala, Belleview, and The
                  Villages.
                </p>
              </div>
            </div>
          </section>

          <section
            className={SUPPORT_CLASS.section}
            aria-labelledby={SUPPORT_SECTION_ID.devices}
            id={SUPPORT_SECTION_ID.devices}
          >
            <h2 className={SUPPORT_CLASS.sectionTitle}>
              Need Coverage for More Devices?
            </h2>
            <p className={SUPPORT_CLASS.sectionText}>{DEVICE_LIMIT_COPY}</p>
            <p className={SUPPORT_CLASS.sectionText}>
              We explain any additional setup, plan, or service costs before
              enrollment.
            </p>
            <p className={SUPPORT_CLASS.sectionText}>
              <Link href={SUPPORT_PATH.contact} className="text-accent hover:underline">
                Contact us about additional devices
              </Link>.
            </p>
          </section>

          <FaqSection items={faq} />
        </main>
      </PageContainer>
    </>
  );
}
