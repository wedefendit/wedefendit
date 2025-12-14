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

import companyInfo from "@/data/company-info.json";

const { name, contact } = companyInfo;
const { phone, email, address } = contact;
const { street, city, state, zip } = address;

export const localBusinessLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.wedefendit.com/#organization",
  name,
  image: "https://www.wedefendit.com/og-image.png",
  logo: "https://www.wedefendit.com/logo.svg",
  url: "https://www.wedefendit.com/",
  telephone: phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: street,
    addressLocality: city,
    addressRegion: state,
    postalCode: zip,
    addressCountry: "US",
  },
  areaServed: [
    "Ocala",
    "Belleview",
    "The Villages",
    "Central Florida",
    "Remote",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    telephone: phone,
    email: email,
    areaServed: "US",
    availableLanguage: "English",
  },
};

export type Crumb = {
  name: string;
  href?: string; // omit for the current page
};

export type GenBreadCrumbsLdProps = {
  items: Crumb[]; // ordered left→right; last is current page,
  baseUrl?: string; // e.g., "https://www.wedefendit.com"
};

export function generateBreadCrumbJsonLd({
  items,
  baseUrl = "https://www.wedefendit.com",
}: GenBreadCrumbsLdProps): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };
}

export type ServiceLdProps = {
  name: string;
  description: string;
  url: string;
  image: string;
  keywords?: string[];
  city?: string;
  provider?: {
    "@type": string; // e.g., "Organization"
    name: string;
  };
  offers?: {
    "@type": string; // e.g., "Offer"
    itemOffered?: {
      "@type": string; // e.g., "Service"
      name: string;
      description: string;
    };
  }[];
};

export function generateServiceLd({
  name,
  url,
  image,
  city = "",
  offers = [],
  description,
  keywords = [],
  provider = { "@type": "Organization", name: "Defend I.T. Solutions" },
}: ServiceLdProps): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    url,
    image,
    provider,
    description,
    keywords: keywords.join(", "),
    areaServed: city ? [`${city} FL`, "Central Florida"] : ["Central Florida"],
    offers: offers.map((offer) => ({
      "@type": "Offer",

      itemOffered: {
        "@type": "Service",
        name: offer.itemOffered?.name || name,
        description: offer.itemOffered?.description || description,
      },
    })),
  };
}
export function generateRelatedServiceLd(
  services: { label: string; slug: string }[],
  isRemote: boolean = false
): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.label,
      url: isRemote
        ? `https://www.wedefendit.com/services/remote/${r.slug}`
        : `https://www.wedefendit.com/services/${r.slug}`,
    })),
  };
}

export function generateFAQPageLd(
  questions: { name: string; acceptedAnswer: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.name,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.acceptedAnswer,
      },
    })),
  };
}
