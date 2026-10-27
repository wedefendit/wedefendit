import jsonData from "@/data/services/list.json";
import { Service, ServicePage } from "@/components/Service";
import { SITE_URL } from "@/lib/og";

export default function ServicesPage() {
  const canonical = `${SITE_URL}/services`;
  const services: Service[] = jsonData.services;

  return (
    <ServicePage
      meta={{
        title:
          "Central Florida Tech Support and Cybersecurity Services | Defend I.T. Solutions",
        description:
          "Local computer repair, virus removal, Wi-Fi and network help, scam protection, and on-site tech support for homes and small businesses in Ocala, Belleview, and The Villages.",
        imageAlt:
          "Cybersecurity & Tech Support, Defend I.T. Solutions, Central Florida",
        url: canonical,
        canonical,
        keywords:
          "computer repair Ocala, virus removal Ocala, scam protection The Villages, Wi-Fi help Belleview, on-site tech support Central Florida, password manager setup Ocala, local tech support",
      }}
      h1="Local Tech Support and Cybersecurity Services"
      services={services}
    />
  );
}
