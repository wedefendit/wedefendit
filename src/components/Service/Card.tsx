import Link from "next/link";
import type { ComponentType } from "react";
import * as Icons from "lucide-react";
import { Card } from "../Card";

export type ServiceCardProps = Readonly<{
  id: string;
  title: string;
  headline: string;
  icons: string[];
  summary: string;
  cta: string;
  slug?: string;
  remote?: boolean;
}>;

type IconComponent = ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

function isIconComponent(value: unknown): value is IconComponent {
  return typeof value === "function" || (typeof value === "object" && value !== null);
}

export function serviceIcon(name: string): IconComponent | undefined {
  const candidate: unknown = Reflect.get(Icons, name);
  return isIconComponent(candidate) ? candidate : undefined;
}

const SVG_VALUES: Readonly<{ round: "round" }> = { round: "round" };

export function serviceSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-/, "")
    .replace(/-$/, "");
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
  const finalSlug = slug || id || serviceSlug(title);
  const isRemote = remote || false;
  const servicePath = isRemote ? `remote/${finalSlug}` : finalSlug;
  const href = `/services/${servicePath}`;

  return (
    <Card
      as={Link}
      href={href}
      interactive
      wash
      className="group relative flex min-h-[300px] flex-col overflow-hidden p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        {icons.map((iconName) => {
          const name = iconName
            .split("-")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join("");
          const LucideIcon = serviceIcon(name);
          return LucideIcon ? (
            <div
              key={iconName}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border-accent bg-surface transition-transform duration-200 group-hover:scale-110"
            >
              <LucideIcon className="w-6 h-6 text-accent" strokeWidth={1.25} />
            </div>
          ) : null;
        })}
      </div>

      <h3 className="text-h3 tracking-h3 font-semibold text-ink mb-3">{title}</h3>

      <div className="mt-auto">
        <p className="mb-4 text-sm leading-relaxed text-ink-muted">
          {summary}
        </p>

        <div className="border-t border-hairline pt-4">
          <span className="flex items-center gap-2 text-sm font-medium text-accent transition-all group-hover:gap-3">
            {cta || "Learn More"}
            <svg
              aria-hidden
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap={SVG_VALUES.round}
                strokeLinejoin={SVG_VALUES.round}
                strokeWidth={1.25}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </Card>
  );
}

export default ServiceCard;
