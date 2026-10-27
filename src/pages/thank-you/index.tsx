import Head from "next/head";
import { useRouter } from "next/router";
import { ogImageUrl, SITE_URL } from "@/lib/og";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components";
import jsonData from "../../../data/company-info.json";
const contact = jsonData.contact;
const CANONICAL = `${SITE_URL}/thank-you`;
const PAGE_TITLE = "Appointment Confirmed | Defend I.T. Solutions";
const OG_IMAGE = ogImageUrl("Appointment Confirmed");

export default function ThankYouPage() {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const router = useRouter();

  useEffect(() => {
    if (secondsLeft <= 0) {
      void router.push("/");
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, router]);

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta
          name="description"
          content="Your appointment with Defend I.T. Solutions is scheduled. Call us if you have questions or need to reschedule."
        />
        <meta
          property="og:title"
          content={PAGE_TITLE}
        />
        <meta
          property="og:description"
          content="Your appointment with Defend I.T. Solutions is scheduled."
        />
        <meta
          property="og:url"
          content={CANONICAL}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={OG_IMAGE}
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={PAGE_TITLE}
        />
        <meta
          name="twitter:description"
          content="Your appointment is scheduled. Call us if you have questions or need to reschedule."
        />
        <meta
          name="twitter:image"
          content={OG_IMAGE}
        />

        <link rel="canonical" href={CANONICAL} />
        <meta
          name="keywords"
          content="Thank You, Appointment Confirmed, Defend I.T. Solutions, Tech Support, The Villages, Ocala, Cybersecurity, Local IT Services"
        />
      </Head>
      <PageContainer>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-10">
          <CheckCircle className="w-16 h-16 text-success mx-auto" />

          <h1 className="text-display tracking-display font-semibold text-ink">
            Your Appointment Is Scheduled
          </h1>

          <p className="text-base sm:text-lg text-ink-muted max-w-xl mx-auto">
            Your appointment is scheduled. We look forward to helping you.
          </p>

          <div className="space-y-2">
            <p className="text-base sm:text-lg text-ink-muted">
              Questions or changes? Call us at:
            </p>
            <a
              href={`tel:+${contact.phone.replace(/\D/g, "")}`}
              className="text-base sm:text-lg text-accent hover:underline break-words"
            >
              {contact.phone}
            </a>
          </div>

          <div className="mt-6 text-base sm:text-lg text-ink-muted">
            Returning to the home page in{" "}
            <span
              className="inline-block text-xl font-semibold text-ink min-w-[2ch] text-center"
              aria-live="polite"
            >
              {secondsLeft}
            </span>{" "}
            seconds.
          </div>

          <p className="text-sm text-ink-dim">
            If you are not redirected automatically,{"\u00a0"}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-accent hover:underline"
            >
              return to the home page
            </button>
            .
          </p>
        </div>
      </PageContainer>
    </>
  );
}
