/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import { BadgeCheck } from "lucide-react";

export function TrustStrip() {
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex items-center gap-3 rounded-lg border border-green-300/60 bg-green-50 dark:bg-green-900/20 px-3 py-2 text-xs sm:text-sm text-green-800 dark:text-green-200"
        aria-label="Business status"
      >
        <BadgeCheck className="w-4 h-4" aria-hidden="true" />
        <span>Registered Florida LLC</span>
        <span aria-hidden="true">•</span>
        <span>Insured</span>
      </div>
    </div>
  );
}

export default TrustStrip;
