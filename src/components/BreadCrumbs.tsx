import Link from "next/link";
import React from "react";
import { generateBreadCrumbJsonLd, type Crumb } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/og";
import JsonLdScript from "./JsonLdScript";

export type BreadCrumbProps = Readonly<{
  items: Crumb[];
  baseUrl?: string;
  includeJsonLd?: boolean;
  className?: string;
}>;

export function BreadCrumbs({
  items,
  baseUrl = SITE_URL,
  includeJsonLd = false,
  className = "",
}: BreadCrumbProps) {
  const breadcrumbLd = includeJsonLd
    ? generateBreadCrumbJsonLd({ items, baseUrl })
    : null;

  return (
    <>
      {breadcrumbLd && <JsonLdScript jsonLd={breadcrumbLd} />}

      <nav
        aria-label="Breadcrumb"
        className={
          "text-xs sm:text-sm text-ink-dim mb-2 overflow-x-auto max-w-full " +
          className
        }
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ol className="flex items-center gap-1 sm:gap-2 min-w-0">
          {items.map((c, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <React.Fragment key={`${c.href ?? "current"}-${c.name}`}>
                <li
                  className={`truncate ${
                    !isLast ? "max-w-[7rem]" : "max-w-[4rem] sm:max-w-[12rem] "
                  }`}
                >
                  {isLast || !c.href ? (
                    <span aria-current="page" className="text-ink-muted">
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
