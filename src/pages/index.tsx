import { ShieldCheck, Wrench, House, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { localBusinessLd } from "@/lib/json-ld";
import companyInfo from "../../data/company-info.json";
import { Meta, PageContainer } from "@/components";
import { InteractiveTraining } from "@/components/InteractiveTraining";
import { Card } from "@/components/Card";
import { ThemedImage } from "@/components/ThemedImage";
import { SITE_URL } from "@/lib/og";

const { contact } = companyInfo;
const HOME_PATH = { contact: "/contact", services: "/services" };
const CONTENT_SECTION_CLASS = "w-full py-12 sm:py-16";
const CONTENT_CONTAINER_CLASS = "mx-auto w-full max-w-6xl px-5 sm:px-6";
const HOME_CLASS = { sectionTitle: "text-h2 tracking-h2 font-semibold text-ink" };
const PRIMARY_ICON_CLASS = "w-5 h-5";
const SMALL_ARROW_CLASS = "h-4 w-4";

type BenefitCardProps = Readonly<{
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}>;

function BenefitCard({ icon, title, description, link }: BenefitCardProps) {
  return (
    <Card
      as={Link}
      href={link}
      interactive
      wash
      className="group relative flex flex-col overflow-hidden p-6 text-left"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border-accent bg-surface">
        {icon}
      </div>
      <h3 className="text-h3 tracking-h3 font-semibold text-ink lg:min-h-[3.5rem]">{title}</h3>
      <p className="mt-2 text-ink-muted text-sm leading-relaxed">
        {description}
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-accent group-hover:underline">
        Learn more <ArrowRight className="w-4 h-4" />
      </span>
    </Card>
  );
}

export default function Home() {
  const benefits = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-accent" />,
      title: "Scam and Account Protection",
      description:
        "Learn to recognize scams, secure your accounts, and reduce the risk of fraud and account theft.",
      link: "/services/scam-protection",
    },
    {
      icon: <Wrench className="w-6 h-6 text-accent" />,
      title: "Computer Repair and Virus Removal",
      description:
        "Fix slow, unstable, or infected computers. We troubleshoot software, remove malware, and explain the problem clearly.",
      link: "/services/computer-repair",
    },
    {
      icon: <House className="w-6 h-6 text-accent" />,
      title: "On-Site Tech Support",
      description:
        "Get help with Wi-Fi, printers, new devices, smart home equipment, and other everyday tech problems.",
      link: "/services/onsite-tech-support",
    },
  ];

  const displayPhone = contact.phone.replace("+1", "");
  const telHref = `tel:${contact.phone.replaceAll(/\D/g, "")}`;

  return (
    <>
      <Meta
        title="Central Florida Cybersecurity and Tech Support | Defend I.T. Solutions"
        description="Local computer repair, virus removal, Wi-Fi help, scam protection, and cybersecurity for homes and small businesses in Ocala, Belleview, and The Villages."
        url={`${SITE_URL}/`}
        canonical={`${SITE_URL}/`}
        keywords="computer repair Ocala FL, virus removal The Villages FL, scam protection Belleview FL, Wi-Fi help Central Florida, on-site tech support Ocala, password manager setup Central Florida, local tech support"
        structuredData={localBusinessLd}
      />

      <PageContainer>
        <section className="relative isolate -mx-3 flex min-h-[20rem] w-full items-start overflow-hidden sm:mx-0 sm:min-h-[34rem] sm:items-center lg:min-h-[40rem]">
          <ThemedImage
            dark="/img/home/home-hero-dark.jpg"
            light="/img/home/home-hero-light.jpg"
            alt="A Central Florida home and storefront with connected, protected devices"
            sizes="100vw"
            priority
            className="object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ground via-ground/75 to-ground/40 lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-ground via-ground/85 to-transparent to-80% lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-ground to-transparent to-[22%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ground to-transparent to-[18%]" />

          <div className="relative mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:py-10">
            <div className="max-w-xl lg:max-w-2xl">
              <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
                Serving Ocala, Belleview, and The Villages
              </p>
              <h1 className="mt-4 text-balance text-display tracking-display font-semibold text-ink">
                Local Cybersecurity and Tech Support for{" "}
                <span className="text-accent">Homes and Small Businesses</span>
              </h1>
              <p className="mt-4 max-w-lg text-lead text-ink-muted">
                Get on-site help with computer repair, virus removal, scam
                protection, Wi-Fi, and account security. We explain the problem,
                your options, and the cost before work begins.
              </p>

              <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <Link
                  href={HOME_PATH.contact}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-fill px-6 py-3.5 text-base font-semibold text-accent-contrast shadow-lg transition-all hover:bg-accent-fill-hover hover:shadow-xl sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                >
                  <Phone className={PRIMARY_ICON_CLASS} />
                  Request Local Help
                </Link>
                <Link
                  href={HOME_PATH.services}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-hairline bg-ground/50 px-6 py-3.5 text-base font-semibold text-ink backdrop-blur-sm transition-all hover:border-accent sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                >
                  View Services
                  <ArrowRight className={PRIMARY_ICON_CLASS} />
                </Link>
              </div>

              <ul className="mt-6 flex flex-wrap gap-2.5">
                {[
                  "Florida LLC & Insured",
                  "Local to Central Florida",
                  "Clear Quotes Before Work Begins",
                  "No Pressure Sales",
                ].map((point) => (
                  <li
                    key={point}
                    className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/70 px-3.5 py-1.5 text-sm text-ink-muted backdrop-blur-sm"
                  >
                    <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={CONTENT_SECTION_CLASS}>
          <div className={CONTENT_CONTAINER_CLASS}>
            <div className="max-w-[42rem]">
              <h2 className={HOME_CLASS.sectionTitle}>
                Local Cybersecurity and Tech Support Services
              </h2>
              <p className="mt-4 text-ink-muted leading-relaxed">
                We repair computers, remove viruses and malware, secure accounts
                and home networks, help clients avoid scams, and set up connected
                devices.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <BenefitCard key={benefit.title} {...benefit} />
              ))}
            </div>
          </div>
        </section>

        <section className={CONTENT_SECTION_CLASS}>
          <div className={CONTENT_CONTAINER_CLASS}>
            <InteractiveTraining />
          </div>
        </section>

        <section className={CONTENT_SECTION_CLASS}>
          <div className={CONTENT_CONTAINER_CLASS}>
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
              <div>
                <h2 className={HOME_CLASS.sectionTitle}>
                  Why Choose Defend I.T. Solutions
                </h2>

                <p className="mt-5 max-w-readable text-lead text-ink-muted">
                  We approach every service call with security in mind. You get
                  clear explanations, practical recommendations, and only the
                  work you need.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    "Local service in Central Florida",
                    "Security-focused recommendations",
                    "Clear quotes before work begins",
                    "No pressure or scare tactics",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-border-accent bg-surface">
                        <ShieldCheck
                          className="h-3.5 w-3.5 text-success"
                          aria-hidden
                        />
                      </span>
                      <p className="font-medium text-ink">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-hairline px-5 py-3 font-semibold text-ink transition hover:border-accent"
                  >
                    About Defend I.T. Solutions
                  </Link>
                  <Link
                    href={HOME_PATH.services}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-hairline px-5 py-3 font-semibold text-ink transition hover:border-accent"
                  >
                    View Services
                    <ArrowRight className={SMALL_ARROW_CLASS} />
                  </Link>
                </div>
              </div>

              <Card wash className="px-6 py-9 text-center sm:px-8">
                <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-accent">
                  Talk to a Local Technician
                </p>
                <a
                  href={telHref}
                  className="mt-4 block text-3xl font-semibold tracking-tight text-ink transition hover:text-accent sm:text-4xl"
                >
                  {displayPhone}
                </a>
                <p className="mt-3 text-sm text-ink-muted">{contact.hours}</p>
                <a
                  href={telHref}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-fill px-6 py-3.5 font-semibold text-accent-contrast shadow-lg transition-all hover:bg-accent-fill-hover hover:shadow-xl"
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
                <Link
                  href={HOME_PATH.contact}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition hover:underline"
                >
                  More Contact Options
                  <ArrowRight className={SMALL_ARROW_CLASS} />
                </Link>
              </Card>
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
