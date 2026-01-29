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

import { Phone, Mail, Calendar } from "lucide-react";
import data from "../../data/company-info.json";
import TrustStrip from "./TrustStrip";

const contact = data.contact;
const services_cta = data.services_cta || {};

export function BookOnline() {
  const tel = `+${contact.phone.replace(/[^0-9]/g, "")}`;
  const displayPhone = contact.phone.replace("+1", "");

  return (
    <section
      id="schedule-service"
      className="border-t border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-2xl mx-auto my-12 px-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6 shadow-sm space-y-6">
          {/* Header */}
          <header className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Schedule Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Mon-Fri: 9 AM - 6 PM • Sat: 10 AM - 4 PM
            </p>
          </header>

          <TrustStrip />

          {/* Primary Actions */}
          <div className="space-y-3">
            {/* Call/Text - Primary */}
            <a
              href={`tel:${tel.replace(/[^0-9]/g, "")}`}
              className="flex items-center gap-3 p-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-medium transition shadow-sm group"
            >
              <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 text-left">
                <div className="text-sm opacity-90">Call or Text</div>
                <div className="text-lg font-bold">{displayPhone}</div>
              </div>
            </a>

            {/* Email - Secondary */}
            <a
              href={`mailto:${contact.service_email}`}
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-sky-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition group"
            >
              <Mail
                className="w-5 h-5 text-blue-600 dark:text-sky-400 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="flex-1 text-left">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Send Email
                </div>
                <div className="text-blue-600 dark:text-sky-400 font-medium break-all">
                  {contact.service_email}
                </div>
              </div>
            </a>
          </div>

          {/* Calendly - Tertiary */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-sky-400 list-none flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Or book online with Calendly</span>
              </summary>

              <div className="mt-3 pl-6">
                <a
                  href={services_cta.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-blue-600 dark:text-sky-400 hover:underline"
                >
                  Continue to Calendly →
                </a>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
