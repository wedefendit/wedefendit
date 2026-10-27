import { useEffect, useState, useSyncExternalStore } from "react";
import { localBusinessLd } from "@/lib/json-ld";
import { ogImageUrl, SITE_URL } from "@/lib/og";
import companyInfo from "../../../data/company-info.json";
import {
  Meta,
  BreadCrumbs,
  CopyableCode,
  PageContainer,
  ServiceAreaAndBooking,
} from "@/components";
import {
  Mail,
  Phone,
  MapPin,
  ChevronUp,
  Fingerprint,
  ChevronDown,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

const { contact, name, service_areas } = companyInfo;
const { phone, email, address, gpg, service_email } = contact;
const { street, city, state, zip } = address;
const { fingerprint, key_id, key_url, secure_email } = gpg;
const CONTACT_CLASS = {
  infoRow: "flex items-start gap-3",
  infoIcon: "w-5 h-5 text-accent mt-1 flex-shrink-0",
  infoHeading: "font-semibold text-ink",
  emailLink: "text-accent hover:underline text-sm break-all",
  smallIcon: "w-4 h-4",
  detailHeading: "font-semibold mb-1",
  detailSection: "pt-2 border-t border-hairline",
};
const CONTACT_VALUE = { touch: { touchAction: "manipulation" }, pgp: "pgp", panel: "pgp-panel", secureQuery: "secure", enabled: "1", hashPrefix: "#" };

function subscribeToLocation(): () => void {
  return () => {};
}

function secureContactRequested(): boolean {
  const url = new URL(globalThis.location.href);
  return url.searchParams.get(CONTACT_VALUE.secureQuery) === CONTACT_VALUE.enabled ||
    url.hash.replace(CONTACT_VALUE.hashPrefix, "") === CONTACT_VALUE.pgp;
}

function serverSecureContactRequested(): boolean {
  return false;
}

function HeadingSection() {
  return (
    <header className="my-4 space-y-3 text-center">
      <h1 className="mx-auto max-w-[14ch] text-balance text-display tracking-display font-semibold text-ink sm:max-w-none">
        Contact Defend I.T. Solutions
      </h1>
      <h2 className="mx-auto mb-6 mt-2 max-w-readable text-lead text-ink-muted">
        Tell us what you need help with, and we will help you choose the
        right service.
      </h2>
    </header>
  );
}

function PrimaryContact() {
  return (
    <div className="relative flex flex-col items-center justify-center space-y-6 overflow-hidden rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] p-8 text-center shadow-card">
      <Phone className="w-16 h-16 text-accent" />
      <div className="space-y-2">
        <h2 className="text-h2 tracking-h2 font-semibold text-ink">
          Call or Text
        </h2>
        <a
          href={`tel:${phone.replace(/\D/g, "")}`}
          className="block text-3xl font-bold text-accent hover:underline"
        >
          {phone.replace("+1", "")}
        </a>
        <p className="text-sm text-ink-muted">
          Use this number for questions, scheduling, and service updates.
        </p>
      </div>
    </div>
  );
}

function ContactInfoCard() {
  return (
    <div className="relative space-y-6 overflow-hidden rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] p-6 shadow-card">
      <h3 className="text-h3 tracking-h3 font-semibold text-ink mb-4">
        Other Ways to Reach Us
      </h3>

      <div className="space-y-4">
        <div className={CONTACT_CLASS.infoRow}>
          <Mail className={CONTACT_CLASS.infoIcon} />
          <div>
            <h4 className={CONTACT_CLASS.infoHeading}>
              General Questions
            </h4>
            <a
              href={`mailto:${email}`}
              className={CONTACT_CLASS.emailLink}
            >
              {email}
            </a>
          </div>
        </div>

        <div className={CONTACT_CLASS.infoRow}>
          <Mail className={CONTACT_CLASS.infoIcon} />
          <div>
            <h4 className={CONTACT_CLASS.infoHeading}>
              Service Requests
            </h4>
            <a
              href={`mailto:${service_email}`}
              className={CONTACT_CLASS.emailLink}
            >
              {service_email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2 border-t border-hairline">
          <MapPin className={CONTACT_CLASS.infoIcon} />
          <div>
            <h4 className="font-semibold text-ink mb-1">
              Mailing Address
            </h4>
            <p className="text-xs text-ink-dim mb-2">
              Mailing address only. No customer storefront.
            </p>
            <address className="text-sm not-italic leading-relaxed text-ink-muted">
              <strong>{name}</strong>
              <br />
              {street}
              <br />
              {city}, {state} {zip}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecureContactCard({
  showPGP,
  setShowPGP,
}: Readonly<{
  showPGP: boolean;
  setShowPGP: (v: boolean) => void;
}>) {
  return (
    <section
      id={CONTACT_VALUE.pgp}
      className="relative overflow-hidden rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] p-6 shadow-card"
    >
      <div className="flex items-start gap-4">
        <ShieldCheck className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-h3 tracking-h3 font-semibold text-ink mb-2">
            Send Sensitive Information Securely
          </h3>
          <p className="text-sm text-ink-muted mb-4">
            Use our PGP public key to encrypt sensitive email before
            sending it.
          </p>

          <button
            type="button"
            onClick={() => setShowPGP(!showPGP)}
            style={CONTACT_VALUE.touch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-accent-fill text-accent-contrast text-sm font-medium shadow transition-all hover:bg-accent-fill-hover touch-manipulation"
            aria-controls={CONTACT_VALUE.panel}
            aria-expanded={showPGP}
          >
            {showPGP ? "Hide" : "Show"} PGP Details
            {showPGP ? (
              <ChevronUp className={CONTACT_CLASS.smallIcon} />
            ) : (
              <ChevronDown className={CONTACT_CLASS.smallIcon} />
            )}
          </button>

          {showPGP && (
            <div
              id={CONTACT_VALUE.panel}
              className="mt-6 space-y-4 rounded-card border border-hairline bg-surface p-4 text-sm text-ink-muted shadow-card"
            >
              <div>
                <p className={CONTACT_CLASS.detailHeading}>Secure Email Address:</p>
                <a
                  href={`mailto:${secure_email}`}
                  className="text-accent hover:underline break-all"
                >
                  {secure_email}
                </a>
              </div>

              <div>
                <a
                  href={key_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={CONTACT_VALUE.touch}
                  className="inline-block rounded bg-accent-fill px-4 py-2 text-accent-contrast font-medium text-sm shadow transition-all hover:bg-accent-fill-hover touch-manipulation"
                >
                  Download Public PGP Key
                </a>
              </div>

              <div className={CONTACT_CLASS.detailSection}>
                <p className={CONTACT_CLASS.detailHeading}>Key ID:</p>
                <CopyableCode text={key_id} />
              </div>

              <div className={CONTACT_CLASS.detailSection}>
                <div className="flex items-center gap-2 mb-2">
                  <Fingerprint className={CONTACT_CLASS.smallIcon} />
                  <p className="font-semibold">Fingerprint:</p>
                </div>
                <CopyableCode text={fingerprint.replace(/\s+/g, "")} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const canonical = `${SITE_URL}/contact`;

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
    { "@type": "ListItem", position: 2, name: "Contact", item: canonical },
  ],
};

const contactPageLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Defend I.T. Solutions",
  url: canonical,
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: ogImageUrl("Contact Defend I.T. Solutions"),
  },
  about: {
    ...localBusinessLd,
    areaServed: service_areas,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contact.phone,
      contactType: "Customer Service",
      availableLanguage: "English",
      email: contact.email,
      serviceUrl: `${SITE_URL}/services`,
      url: canonical,
      areaServed: service_areas,
    },
  },
};

export default function ContactPage() {
  const requestedSecureContact = useSyncExternalStore(
    subscribeToLocation,
    secureContactRequested,
    serverSecureContactRequested,
  );
  const [showPgpOverride, setShowPgpOverride] = useState<boolean | null>(null);
  const showPGP = showPgpOverride ?? requestedSecureContact;

  useEffect(() => {
    if (requestedSecureContact) {
      const el = document.getElementById(CONTACT_VALUE.pgp);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [requestedSecureContact]);

  return (
    <>
      <Meta
        url={canonical}
        canonical={canonical}
        title="Contact Defend I.T. | Tech Support in Ocala and The Villages"
        description="Call, text, or message Defend I.T. Solutions for computer repair, cybersecurity, scam help, Wi-Fi, and tech support in Ocala, Belleview, and The Villages."
        keywords="contact tech support Ocala FL, computer repair Ocala, cybersecurity help The Villages, scam help Belleview FL, Wi-Fi support Central Florida, Defend I.T. Solutions"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [breadcrumbLd, contactPageLd],
        }}
      />

      <PageContainer>
        <div className="max-w-6xl mx-auto w-full px-3 py-8 sm:px-4 sm:py-10 space-y-8 sm:space-y-10">
          <BreadCrumbs
            includeJsonLd={true}
            items={[{ name: "Home", href: "/" }, { name: "Contact" }]}
          />

          <HeadingSection />

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <PrimaryContact />
            <ContactInfoCard />
          </div>

          <SecureContactCard showPGP={showPGP} setShowPGP={setShowPgpOverride} />

          <section className="relative overflow-hidden rounded-feature border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-h3 tracking-h3 font-semibold text-ink">
                  Send Us a Message
                </h3>
              </div>
            </div>
            <p className="text-sm text-ink-muted mb-6">
              Describe the problem, the device, and how you prefer to be
              contacted. Do not include passwords or security codes.
            </p>
            <ContactForm className="max-w-xl mx-auto" />
          </section>

          <ServiceAreaAndBooking />
        </div>
      </PageContainer>
    </>
  );
}
