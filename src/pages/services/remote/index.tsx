import remote from "@/data/services/remote/data.json";
import { ServicePage } from "@/components";
import { SITE_URL } from "@/lib/og";

const PAGE_TITLE = "Remote Tech Support and Online Training";

export default function RemoteServicesPage() {
  return (
    <ServicePage
      meta={{
        title:
          `${PAGE_TITLE} | Defend I.T. Solutions`,
        description:
          "Explore remote tech support for enrolled Central Florida clients, plus online tech training and cybersecurity tutoring available across the United States.",
        url: `${SITE_URL}/services/remote`,
        imageAlt: "Remote Tech Support and Online Training, Defend I.T. Solutions",
        keywords:
          "remote tech support, online tech training, cybersecurity tutoring, online computer help, remote malware removal, Central Florida Remote Support Plan",
      }}
      h1={PAGE_TITLE}
      services={remote.services}
      remote={true}
    />
  );
}
