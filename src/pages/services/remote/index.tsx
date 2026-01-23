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

import remote from "@/data/services/remote/data.json";
import { ServicePage } from "@/components";

export default function RemoteServicesPage() {
  return (
    <ServicePage
      meta={{
        title:
          "Remote Tech Support, Cybersecurity & IT Tutoring | Defend I.T. Solutions",
        description:
          "Nationwide remote IT services including remote tech support, cybersecurity assessments, privacy hardening, malware removal, and one-on-one remote tech tutoring.",
        url: "https://www.wedefendit.com/services/remote",
        image: "https://www.wedefendit.com/og-image.png",
        keywords:
          "remote tech support, remote IT services, cybersecurity tutoring, IT tutoring online, remote malware removal, privacy hardening, remote computer help",
      }}
      h1="Remote IT Services, Cybersecurity & Tech Tutoring"
      services={remote.services}
      remote={true}
    />
  );
}
