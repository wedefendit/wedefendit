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
}: ServiceCardProps) {
  const finalSlug = slug || id || toSlug(title);
  const isRemote = remote || false;
  const href = `/services/${isRemote ? `remote/${finalSlug}` : finalSlug}`;

  return (
    <Link
      href={href}
      className="p-6 bg-white/10 flex flex-col justify-around items-start dark:bg-slate-800/20 border border-gray-100 dark:border-gray-800 rounded-md shadow-sm hover:shadow-md hover:shadow-blue-500 hover:bg-blue-200/10 dark:hover:shadow-sky-400 hover:border-blue-500 dark:hover:bg-sky-700/10 dark:hover:border-sky-400 transition space-y-3"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <div className="flex items-center gap-3 flex-wrap">
        {icons.map((iconName, idx) => {
          const name = iconName
            .split("-")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join("");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const LucideIcon = (Icons as any)[name];
          return LucideIcon ? (
            <LucideIcon
              key={idx}
              className="w-5 h-5 text-blue-500 dark:text-sky-400"
            />
          ) : null;
        })}
      </div>

      <p className="text-gray-700 dark:text-gray-300 text-sm">{summary}</p>
    </Link>
  );
}

export default ServiceCard;
