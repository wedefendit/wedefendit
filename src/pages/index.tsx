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
import {
  ShieldCheck,
  Wrench,
  GraduationCap,
  Phone,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { localBusinessLd } from "@/lib/json-ld";
import companyInfo from "../../data/company-info.json";
import { Meta, PageContainer } from "@/components";

const { contact } = companyInfo;

type BenefitCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
};

function BenefitCard({ icon, title, description, link }: BenefitCardProps) {
  return (
    <Link
      href={link}
      className="group flex flex-col items-center text-center p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-sky-500 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-all"
    >
      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-sky-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
      <span className="mt-4 text-blue-600 dark:text-sky-400 text-sm font-medium group-hover:underline inline-flex items-center gap-1">
        Learn more <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 py-6 border-y border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <span className="text-green-600 dark:text-green-400">✓</span>
        <span>Florida LLC & Insured</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-600 dark:text-green-400">✓</span>
        <span>Local to Central Florida</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-600 dark:text-green-400">✓</span>
        <span>Clear Pricing</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-600 dark:text-green-400">✓</span>
        <span>No Pressure Sales</span>
      </div>
    </div>
  );
}

export default function Home() {
  const benefits = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-sky-400" />,
      title: "Protect",
      description:
        "Stop scams targeting seniors, secure home networks, remove viruses and malware, and prevent future threats.",
      link: "/services/custom-solutions",
    },
    {
      icon: <Wrench className="w-8 h-8 text-blue-600 dark:text-sky-400" />,
      title: "Fix",
      description:
        "Repair slow computers, troubleshoot software issues, recover lost data, and upgrade aging hardware.",
      link: "/services/computer-repair",
    },
    {
      icon: (
        <GraduationCap className="w-8 h-8 text-blue-600 dark:text-sky-400" />
      ),
      title: "Teach",
      description:
        "Learn to recognize online threats, use technology safely, and understand your devices without the jargon.",
      link: "/services/remote/remote-tech-tutoring",
    },
  ];

  const displayPhone = contact.phone.replace("+1", "");

  return (
    <>
      <Meta
        title="Defend I.T. Solutions | Cybersecurity & IT Support"
        description="Professional cybersecurity and IT support for homeowners, retirees, and small businesses in Ocala, The Villages, and Belleview. Clear solutions, no jargon."
        image="https://www.wedefendit.com/og-image.png"
        url="https://www.wedefendit.com/"
        canonical="https://www.wedefendit.com/"
        keywords="cybersecurity, IT support, Ocala FL, The Villages, Belleview, small business IT, home tech support, network security, computer repair, online safety"
        structuredData={localBusinessLd}
      />

      <PageContainer>
        {/* Hero Section */}
        <header className="text-center px-4 py-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            Cybersecurity & IT Support
            <span className="block text-blue-600 dark:text-sky-400 mt-2">
              You Can Actually Understand
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Serving Ocala, The Villages, and Belleview with honest tech support
            for homes and small businesses.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Phone className="w-5 h-5" />
              Schedule Service
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-sky-500 text-gray-700 dark:text-gray-300 text-lg font-semibold transition-all"
            >
              View Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </header>

        <TrustBar />

        {/* What We Do Section */}
        <section className="py-12 px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            What We Do
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            We keep your technology safe, fix problems when they happen, and
            help you understand it all along the way.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.title} {...benefit} />
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 px-4 bg-gray-50 dark:bg-slate-900/30 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Why Choose Defend I.T. Solutions?
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-sky-400 font-bold text-xl flex-shrink-0">
                •
              </span>
              <p>
                <strong>No Jargon:</strong> We explain everything in plain
                English so you actually understand what&apos;s happening.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-sky-400 font-bold text-xl flex-shrink-0">
                •
              </span>
              <p>
                <strong>No Upsells:</strong> We only recommend what you actually
                need. No scare tactics, no hidden fees.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-sky-400 font-bold text-xl flex-shrink-0">
                •
              </span>
              <p>
                <strong>Local & Trusted:</strong> We&apos;re based in Central
                Florida and available for in-person service across Ocala, The
                Villages, and Belleview.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-12 px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Call us today or schedule a convenient time to talk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Phone className="w-5 h-5" />
              {displayPhone}
            </a>
            <Link
              href="/contact"
              className="text-blue-600 dark:text-sky-400 hover:underline text-lg font-medium"
            >
              Or view all contact options →
            </Link>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
