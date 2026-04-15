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

import Link from "next/link";
import React from "react";
import { generateBreadCrumbJsonLd, type Crumb } from "@/lib/json-ld";
import JsonLdScript from "./JsonLdScript";

export type BreadCrumbProps = {
  items: Crumb[]; // ordered left→right; last is current page
  baseUrl?: string; // e.g., "https://www.wedefendit.com"
  includeJsonLd?: boolean; // defaults true
  className?: string;
};

export function BreadCrumbs({
  items,
  baseUrl = "https://www.wedefendit.com",
  includeJsonLd = false,
  className = "",
}: BreadCrumbProps) {
  // JSON-LD
  const breadcrumbLd = includeJsonLd
    ? generateBreadCrumbJsonLd({ items, baseUrl })
    : null;

  return (
    <>
      {includeJsonLd && JsonLdScript({ jsonLd: breadcrumbLd as object })}

      <nav
        aria-label="Breadcrumb"
        className={
          "text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 overflow-x-auto max-w-full " +
          className
        }
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ol className="flex items-center gap-1 sm:gap-2 min-w-0">
          {items.map((c, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <React.Fragment key={idx}>
                <li
                  className={`truncate ${
                    !isLast ? "max-w-[7rem]" : "max-w-[4rem] sm:max-w-[12rem] "
                  }`}
                >
                  {isLast || !c.href ? (
                    <span
                      aria-current="page"
                      className="text-gray-400 dark:text-gray-500"
                    >
                      {c.name}
                    </span>
                  ) : (
                    <Link href={c.href} className="hover:underline">
                      {c.name}
                    </Link>
                  )}
                </li>
                {!isLast && (
                  <li aria-hidden="true" className="px-1 sm:px-2">
                    ›
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default BreadCrumbs;
