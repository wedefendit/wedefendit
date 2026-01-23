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

import jsonData from "@/data/services/list.json";
import { Service, ServicePage } from "@/components/Service";
// import { useLocationRedirect } from "@/hooks/useLocationRedirect";
import { generateBreadCrumbJsonLd, generateServiceLd } from "@/lib/json-ld";
export default function ServicesPage() {
  // useLocationRedirect(true); // auto-redirects if match found

  const canonical = "https://www.wedefendit.com/services";
  const services = jsonData.services as Service[]; // expects { name, slug, description? }

  const breadcrumbLd = generateBreadCrumbJsonLd({
    items: [
      { name: "Home", href: "https://www.wedefendit.com/" },
      { name: "Services", href: canonical },
    ],
    baseUrl: "https://www.wedefendit.com",
  });

  const serviceLd = generateServiceLd({
    name: "Cybersecurity, IT Support & Tech Tutoring Services | Defend I.T. Solutions",
    description:
      "Explore in-person I.T. support, secure home networking, tech tutoring, and business cybersecurity services for The Villages, Ocala, and Central Florida.",
    url: canonical,
    image: "https://www.wedefendit.com/og-image.png",
    offers: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.summary || "",
      },
      availability: "https://schema.org/InStock",
    })),
  });

  return (
    <ServicePage
      meta={{
        title:
          "Cybersecurity, IT Support & Tech Tutoring Services | Defend I.T. Solutions",
        description:
          "Explore in-person I.T. support, secure home networking, tech tutoring, and business cybersecurity services for The Villages, Ocala, and Central Florida.",
        image: "https://www.wedefendit.com/og-image.png",
        url: canonical,
        canonical,
        keywords:
          "IT support, cybersecurity, tech help, The Villages, Ocala, home networking, small business IT, computer repair, local tech services",
        structuredData: { "@graph": [breadcrumbLd, serviceLd] },
      }}
      h1="Cybersecurity, IT Support & Tech Tutoring Services"
      services={services}
    />
  );
}
