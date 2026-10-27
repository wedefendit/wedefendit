import type { GetStaticProps } from "next";
import Link from "next/link";
import { Meta, PageContainer, BreadCrumbs } from "@/components";
import { HeroBanner } from "@/components/HeroBanner";
import { SITE_URL } from "@/lib/og";
import {
  getStaticLocationsIndexProps,
  type LocationSummary,
} from "@/lib/location-page";

const CANONICAL = `${SITE_URL}/service-areas`;
const TOUCH: Readonly<{ touchAction: "manipulation" }> = { touchAction: "manipulation" };
const AREA_LINK =
  "flex h-full flex-col gap-1 rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] p-5 transition hover:border-border-accent touch-manipulation";

export const getStaticProps: GetStaticProps = getStaticLocationsIndexProps;

type ServiceAreasIndexProps = Readonly<{ locations: LocationSummary[] }>;

export default function ServiceAreasIndex({ locations }: ServiceAreasIndexProps) {
  const crumbs = [{ name: "Home", href: "/" }, { name: "Serving Central Florida" }];

  return (
    <>
      <Meta
        title="Central Florida Cybersecurity and Tech Support Service Areas"
        description="Find local computer repair, virus removal, Wi-Fi help, scam protection, and on-site tech support in Ocala, Belleview, The Villages, and nearby communities."
        url={CANONICAL}
        canonical={CANONICAL}
      />

      <PageContainer>
        <div className="mx-auto w-full max-w-6xl px-4 pt-1 sm:px-6">
          <BreadCrumbs items={crumbs} baseUrl={SITE_URL} />
        </div>

        <HeroBanner
          dark="/img/about/about-hero-dark.jpg"
          light="/img/about/about-hero-light.jpg"
          alt="Central Florida homes served by Defend I.T. Solutions"
        >
          <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
            Service Areas
          </p>
          <h1 className="mt-4 text-balance text-display tracking-display font-semibold text-ink">
            Local Cybersecurity and Tech Support Near You
          </h1>
          <p className="mt-5 max-w-lg text-lead text-ink-muted">
            We provide on-site help for homes and small businesses in Ocala,
            Belleview, The Villages, and nearby communities.
          </p>
        </HeroBanner>

        <div className="mx-auto w-full max-w-5xl px-3 pb-10 sm:px-6">
          <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
            {locations.map((location) => (
              <li key={location.slug}>
                <Link
                  href={`/service-areas/${location.slug}`}
                  className={AREA_LINK}
                  style={TOUCH}
                >
                  <span className="font-semibold text-ink">
                    {location.city}, {location.state}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-muted">
                    {location.headline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </>
  );
}
