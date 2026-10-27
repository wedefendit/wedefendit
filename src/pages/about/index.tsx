import Link from "next/link";
import { localBusinessLd } from "@/lib/json-ld";
import { ogImageUrl, SITE_URL } from "@/lib/og";
import { HeroBanner } from "@/components/HeroBanner";
import type { ComponentType, SVGProps } from "react";
import { ShieldCheck, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { PageContainer, Meta, BookOnline, BreadCrumbs } from "@/components";
import { Card } from "@/components/Card";

type ValueData = Readonly<{ title: string; description: string; icon: ComponentType<SVGProps<SVGSVGElement>> }>;

const valueData: ReadonlyArray<ValueData> = [
  {
    title: "Practical Security",
    description:
      "We recommend protections that fit the problem, the devices, and the budget.",
    icon: ShieldCheck,
  },
  {
    title: "Local, Personal Service",
    description:
      "Work directly with a local technician. We do not use call centers or outsourced support scripts.",
    icon: MapPin,
  },
  {
    title: "Clear Recommendations",
    description:
      "We explain the problem, the available options, and what can wait so you can make an informed decision.",
    icon: MessageCircle,
  },
];

const CARD_CLASS = "relative overflow-hidden p-6";
const MUTED_LEAD_CLASS = "text-lead mt-4 text-ink-muted";
const ABOUT_SECTION_ID = { introduction: "who-we-are", values: "core-values" };

type ValueItemProps = Readonly<{
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}>;

function ValueItem({ title, description, Icon }: ValueItemProps) {
  return (
    <Card as="article" wash className={CARD_CLASS}>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-border-accent bg-surface">
          <Icon className="w-7 h-7 text-accent" aria-hidden="true" />
        </div>
        <h3 className="text-h3 tracking-h3 font-semibold text-ink">{title}</h3>
      </div>
      <p className="text-ink-muted leading-relaxed">{description}</p>
    </Card>
  );
}

function RenderValues() {
  return (
    <ul className="grid gap-6 md:grid-cols-1">
      {valueData.map((item) => (
        <li key={item.title}>
          <ValueItem
            title={item.title}
            description={item.description}
            Icon={item.icon}
          />
        </li>
      ))}
    </ul>
  );
}

export default function About() {
  const canonical = `${SITE_URL}/about`;

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
      url: ogImageUrl("About Defend I.T. Solutions"),
    },
    about: {
      ...localBusinessLd,
      hasMap:
        "https://www.google.com/maps/search/?api=1&query=Defend+I.T.+Solutions+Ocala+FL",
    },
  };

  return (
    <>
      <Meta
        title="About Defend I.T. | Ocala Cybersecurity and Tech Support"
        description="Meet Defend I.T. Solutions, a local cybersecurity and tech support company serving Ocala, Belleview, The Villages, and nearby Central Florida communities."
        url={canonical}
        canonical={canonical}
        keywords="local cybersecurity company Ocala FL, tech support Ocala, computer help Belleview FL, tech support The Villages FL, Central Florida computer services, Defend I.T. Solutions"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [breadcrumbLd, aboutPageLd],
        }}
      />

      <PageContainer>
        <div className="mx-auto w-full max-w-6xl px-4 pt-1 sm:px-6">
          <BreadCrumbs
            includeJsonLd={false}
            items={[{ name: "Home", href: "/" }, { name: "About" }]}
          />
        </div>

        <HeroBanner
          dark="/img/home/home-hero-dark.jpg"
          light="/img/home/home-hero-light.jpg"
          alt="Central Florida homes and connected devices protected by cybersecurity services"
        >
          <p className="inline-flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
            <MapPin className="h-4 w-4" aria-hidden />
            Locally Owned and Operated
          </p>
          <h1 className="mt-4 text-balance text-display tracking-display font-semibold text-ink">
            About Defend I.T. Solutions
          </h1>
          <p className="mt-5 max-w-lg text-lead text-ink-muted">
            Local cybersecurity and tech support for homes and small businesses
            in Ocala, Belleview, The Villages, and nearby communities.
          </p>
        </HeroBanner>

        <div className="max-w-5xl mx-auto w-full px-3 pb-3 sm:px-4 space-y-8 sm:space-y-10">

          <Card
            as="section"
            aria-labelledby={ABOUT_SECTION_ID.introduction}
            wash
            className={CARD_CLASS}
          >
            <h2 id={ABOUT_SECTION_ID.introduction} className="sr-only">
              Who we are
            </h2>
            <p className="text-lead text-ink">
              Defend I.T. Solutions is a founder-led business serving homes and
              small businesses in Ocala, Belleview, The Villages, and nearby
              Central Florida communities. Service is available on-site or by
              arranged pickup and return. Remote support is available for
              enrolled clients, with online training and tutoring offered
              separately.
            </p>

            <p className={MUTED_LEAD_CLASS}>
              We help with computer repair, malware removal, scam recovery, Wi-Fi
              and network problems, account security, device setup, and other
              everyday technology needs.
            </p>

            <p className={MUTED_LEAD_CLASS}>
              Our goal is to solve the immediate problem, reduce avoidable risk,
              and explain the result in plain English. You should know what
              changed, why it matters, and what to do next.
            </p>
          </Card>

          <section aria-labelledby={ABOUT_SECTION_ID.values}>
            <h2
              id={ABOUT_SECTION_ID.values}
              className="text-h2 tracking-h2 font-semibold text-ink mb-4"
            >
              How We Work
            </h2>
            <RenderValues />
          </section>

          <Card wash className="relative overflow-hidden p-8 text-center">
            <h2 className="text-h2 tracking-h2 font-semibold mb-4 text-ink">
              Find the Right Service
            </h2>
            <p className="text-ink-muted mb-6 max-w-readable mx-auto">
              Explore local help with computer repair, virus and malware removal,
              scam protection, Wi-Fi, account security, and on-site tech support.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-fill text-accent-contrast font-semibold transition-all shadow-lg hover:bg-accent-fill-hover hover:shadow-xl"
            >
              View Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Card>

          <BookOnline />
        </div>
      </PageContainer>
    </>
  );
}
