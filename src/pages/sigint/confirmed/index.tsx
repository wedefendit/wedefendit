import { Check, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Meta, PageContainer } from "@/components";

const DEMO_URL = "https://sigint.atropeano.com";

export default function ConfirmedPage() {
  return (
    <>
      <Meta
        title="Email Confirmed | SIGINT Dashboard"
        description="Your email address is confirmed for SIGINT Dashboard project updates."
        url="https://www.wedefendit.com/sigint/confirmed"
        canonical="https://www.wedefendit.com/sigint/confirmed"
        noindex
      />

      <PageContainer>
        <div className="w-full max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sky-500/10 border border-sky-500/30 mb-6">
            <Check className="w-7 h-7 sm:w-8 sm:h-8 text-sky-400" />
          </div>

          <h1 className="text-h2 tracking-h2 font-semibold text-ink mb-4">
            Your email is confirmed.
          </h1>

          <p className="text-lead text-ink-muted mb-3 leading-relaxed">
            We will send you updates about SIGINT Dashboard development and
            releases.
          </p>

          <p className="text-xs sm:text-sm text-ink-dim mb-8 sm:mb-10">
            You can review the project demo or return to the SIGINT page.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ touchAction: "manipulation" }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-lg border border-success/40 hover:border-success bg-success/10 hover:bg-success/20 text-ink text-base sm:text-lg font-medium transition-all touch-manipulation"
            >
              <Globe className="w-5 h-5" />
              Open Project Demo
            </a>
            <Link
              href="/sigint"
              style={{ touchAction: "manipulation" }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-accent hover:text-accent-hover text-base sm:text-lg font-medium transition-colors touch-manipulation"
            >
              Back to SIGINT
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
