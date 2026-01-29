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

import Link from "next/link";
import * as Icons from "lucide-react";

export type ServiceCardProps = {
  id: string;
  title: string;
  headline: string;
  icons: string[];
  summary: string;
  cta: string;
  slug?: string;
  remote?: boolean;
};

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ServiceCard({
  id,
  title,
  summary,
  icons,
  slug,
  remote,
  cta,
}: ServiceCardProps) {
  const finalSlug = slug || id || toSlug(title);
  const isRemote = remote || false;
  const href = `/services/${isRemote ? `remote/${finalSlug}` : finalSlug}`;

  return (
    <Link
      href={href}
      className="p-6 bg-white dark:bg-slate-800/50 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg hover:shadow-blue-500/20 hover:bg-blue-50 dark:hover:shadow-sky-400/20 hover:border-blue-500 dark:hover:bg-sky-900/20 dark:hover:border-sky-400 transition-all duration-300 group min-h-[300px]"
    >
      {/* Icon Section */}
      <div className="flex items-center gap-3 mb-4">
        {icons.map((iconName, idx) => {
          const name = iconName
            .split("-")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join("");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const LucideIcon = (Icons as any)[name];
          return LucideIcon ? (
            <div
              key={idx}
              className="w-12 h-12 rounded-full bg-blue-100 dark:bg-sky-900/30 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <LucideIcon className="w-6 h-6 text-blue-600 dark:text-sky-400" />
            </div>
          ) : null;
        })}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>

      {/* Summary - Grows to fill space */}
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-grow mb-4">
        {summary}
      </p>

      {/* CTA - Fixed at bottom */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-blue-600 dark:text-sky-400 flex items-center gap-2 group-hover:gap-3 transition-all">
          {cta || "Learn More"}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default ServiceCard;
