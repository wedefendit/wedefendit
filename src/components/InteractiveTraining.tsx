import Link from "next/link";
import { Card } from "./Card";

type GameCard = Readonly<{
  href: string;
  title: string;
  description: string;
  badge: string;
  meta: string;
  thumbnail: React.ReactNode;
  comingSoon?: boolean;
  demo?: boolean;
}>;
const THUMBNAIL_ART = { width: 140, height: 110, houseBrown: "#5d4a38", houseDark: "#4a3c30", houseLight: "#d4c4a0", houseWidth: 104, rightEdge: 100, cyan: "#38bdf8", purple: "#a78bfa", grid: "#1a3a4a", neon: "#00f0ff", red: "#ff003c", panel: "#1e293b", muted: "#64748b", marker: 112, labelY: 104, softOpacity: 0.4, half: 0.5, textAnchor: "middle", font: "sans-serif", smallText: 5.5 };

function TrainingThumbnail({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <svg viewBox={`0 0 ${THUMBNAIL_ART.width} ${THUMBNAIL_ART.height}`} width={THUMBNAIL_ART.width} height={THUMBNAIL_ART.height} aria-hidden className="drop-shadow-md">
      {children}
    </svg>
  );
}

function HouseThumbnail() {
  return (
    <TrainingThumbnail>
      <polygon points="70,12 16,50 124,50" fill="#4a5568" />
      <rect x="94" y="22" width="10" height="18" fill={THUMBNAIL_ART.houseBrown} />
      <rect x="92" y="20" width="14" height="4" fill={THUMBNAIL_ART.houseDark} />
      <rect x="18" y="50" width={THUMBNAIL_ART.houseWidth} height="50" fill="#6b5744" />
      <rect x="22" y="54" width="48" height="20" fill={THUMBNAIL_ART.houseLight} />
      <rect x="72" y="54" width="48" height="20" fill="#ccc4b4" />
      <rect x="20" y="75" width="102" height="3" fill={THUMBNAIL_ART.houseDark} />
      <rect x="22" y="79" width="48" height="19" fill={THUMBNAIL_ART.houseLight} />
      <rect x="72" y="79" width="48" height="19" fill="#ddd8d0" />
      <rect x="18" y="100" width={THUMBNAIL_ART.houseWidth} height="5" fill="#2e261f" />
      <rect x="90" y="84" width="12" height="14" fill={THUMBNAIL_ART.houseBrown} />
      <circle cx={THUMBNAIL_ART.rightEdge} cy="92" r="1" fill="#d4a84b" />
      <rect x="34" y="60" width="8" height="6" fill={THUMBNAIL_ART.cyan} opacity={THUMBNAIL_ART.softOpacity} />
      <rect x="50" y="60" width="8" height="6" fill={THUMBNAIL_ART.cyan} opacity={THUMBNAIL_ART.softOpacity} />
      <rect x="84" y="60" width="8" height="6" fill={THUMBNAIL_ART.purple} opacity={THUMBNAIL_ART.softOpacity} />
      <rect x={THUMBNAIL_ART.rightEdge} y="60" width="8" height="6" fill={THUMBNAIL_ART.purple} opacity={THUMBNAIL_ART.softOpacity} />
    </TrainingThumbnail>
  );
}

function GridRunnerThumbnail() {
  return (
    <TrainingThumbnail>
      <rect x="0" y="0" width={THUMBNAIL_ART.width} height={THUMBNAIL_ART.height} fill="#0a0e1a" rx="4" />
      <line
        x1="0"
        y1="22"
        x2={THUMBNAIL_ART.width}
        y2="22"
        stroke={THUMBNAIL_ART.grid}
        strokeWidth={THUMBNAIL_ART.half}
      />
      <line
        x1="0"
        y1="44"
        x2={THUMBNAIL_ART.width}
        y2="44"
        stroke={THUMBNAIL_ART.grid}
        strokeWidth={THUMBNAIL_ART.half}
      />
      <line
        x1="0"
        y1="66"
        x2={THUMBNAIL_ART.width}
        y2="66"
        stroke={THUMBNAIL_ART.grid}
        strokeWidth={THUMBNAIL_ART.half}
      />
      <line
        x1="0"
        y1="88"
        x2={THUMBNAIL_ART.width}
        y2="88"
        stroke={THUMBNAIL_ART.grid}
        strokeWidth={THUMBNAIL_ART.half}
      />
      <line
        x1="28"
        y1="0"
        x2="28"
        y2={THUMBNAIL_ART.height}
        stroke={THUMBNAIL_ART.grid}
        strokeWidth={THUMBNAIL_ART.half}
      />
      <line
        x1="56"
        y1="0"
        x2="56"
        y2={THUMBNAIL_ART.height}
        stroke={THUMBNAIL_ART.grid}
        strokeWidth={THUMBNAIL_ART.half}
      />
      <line
        x1="84"
        y1="0"
        x2="84"
        y2={THUMBNAIL_ART.height}
        stroke={THUMBNAIL_ART.grid}
        strokeWidth={THUMBNAIL_ART.half}
      />
      <line
        x1={THUMBNAIL_ART.marker}
        y1="0"
        x2={THUMBNAIL_ART.marker}
        y2={THUMBNAIL_ART.height}
        stroke={THUMBNAIL_ART.grid}
        strokeWidth={THUMBNAIL_ART.half}
      />
      <rect
        x="54"
        y="42"
        width="8"
        height="8"
        fill={THUMBNAIL_ART.neon}
        opacity="0.9"
        rx="1"
      />
      <rect
        x="82"
        y="64"
        width="8"
        height="8"
        fill={THUMBNAIL_ART.red}
        opacity="0.7"
        rx="1"
      />
      <rect
        x="26"
        y="64"
        width="8"
        height="8"
        fill={THUMBNAIL_ART.red}
        opacity={THUMBNAIL_ART.half}
        rx="1"
      />
      <circle
        cx="58"
        cy="46"
        r="12"
        fill="none"
        stroke={THUMBNAIL_ART.neon}
        strokeWidth={THUMBNAIL_ART.half}
        opacity="0.3"
      />
      <text
        x="70"
        y={THUMBNAIL_ART.labelY}
        textAnchor={THUMBNAIL_ART.textAnchor}
        fill={THUMBNAIL_ART.neon}
        fontSize="6"
        fontFamily="monospace"
        opacity={THUMBNAIL_ART.half}
      >
        GRIDRUNNER
      </text>
    </TrainingThumbnail>
  );
}

function PhishTankThumbnail() {
  return (
    <TrainingThumbnail>
      <rect x="0" y="0" width={THUMBNAIL_ART.width} height={THUMBNAIL_ART.height} fill="#0f1729" rx="4" />
      <rect x="20" y="16" width={THUMBNAIL_ART.rightEdge} height="14" fill={THUMBNAIL_ART.panel} rx="3" />
      <rect x="24" y="20" width="60" height="6" fill="#334155" rx="2" />
      <circle cx={THUMBNAIL_ART.marker} cy="23" r="4" fill="#22c55e" opacity="0.6" />
      <rect x="20" y="38" width={THUMBNAIL_ART.rightEdge} height="52" fill={THUMBNAIL_ART.panel} rx="3" />
      <text
        x="70"
        y="56"
        textAnchor={THUMBNAIL_ART.textAnchor}
        fill="#94a3b8"
        fontSize="7"
        fontFamily={THUMBNAIL_ART.font}
      >
        From: support@bankk.com
      </text>
      <text
        x="70"
        y="68"
        textAnchor={THUMBNAIL_ART.textAnchor}
        fill={THUMBNAIL_ART.muted}
        fontSize={THUMBNAIL_ART.smallText}
        fontFamily={THUMBNAIL_ART.font}
      >
        Your account has been locked.
      </text>
      <text
        x="70"
        y="76"
        textAnchor={THUMBNAIL_ART.textAnchor}
        fill={THUMBNAIL_ART.muted}
        fontSize={THUMBNAIL_ART.smallText}
        fontFamily={THUMBNAIL_ART.font}
      >
        Click here to verify your identity.
      </text>
      <rect
        x="48"
        y="82"
        width="44"
        height="10"
        fill="#ef4444"
        opacity="0.8"
        rx="2"
      />
      <text
        x="70"
        y="89"
        textAnchor={THUMBNAIL_ART.textAnchor}
        fill="#fff"
        fontSize="5"
        fontFamily={THUMBNAIL_ART.font}
        fontWeight="bold"
      >
        PHISH?
      </text>
    </TrainingThumbnail>
  );
}

const GAMES: GameCard[] = [
  {
    href: "/awareness/digital-house",
    title: "The Digital House",
    description:
      "Build a safer home network. Place connected devices in rooms and network zones, then see how each choice changes risk and recovery.",
    badge: "New",
    meta: "Game · 5 min",
    thumbnail: <HouseThumbnail />,
  },
  {
    href: "/awareness/gridrunner",
    title: "GRIDRUNNER",
    description:
      "Explore cyberspace, face threat actors, and learn how cybersecurity tools support investigation and defense.",
    badge: "Demo",
    meta: "RPG · 20-25 min",
    thumbnail: <GridRunnerThumbnail />,
    demo: true,
  },
  {
    href: "/awareness",
    title: "Phish Tank",
    description:
      "Review simulated emails, identify phishing signs, and decide which messages are safe before time runs out.",
    badge: "Coming Soon",
    meta: "Quiz · 3 min",
    thumbnail: <PhishTankThumbnail />,
    comingSoon: true,
  },
];

function TrainingCard({ card }: Readonly<{ card: GameCard }>) {
  const inner = (
    <>
      {card.demo && (
        <div className="pointer-events-none absolute right-3 top-3 z-10 rotate-6 select-none">
          <span className="inline-block rounded-sm border-[2.5px] border-danger px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-danger">
            Demo
          </span>
        </div>
      )}
      <div className={`relative ${card.comingSoon ? "opacity-50" : ""}`}>
        <div className="mb-4 flex items-end justify-center rounded-xl border border-hairline bg-surface-inset p-4">
          {card.thumbnail}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={[
              "inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
              card.comingSoon
                ? "border-hairline bg-surface-inset text-ink-dim"
                : "border-border-accent bg-surface text-accent",
            ].join(" ")}
          >
            {card.badge}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
            {card.meta}
          </span>
        </div>
        <h3 className="mt-2 text-h3 tracking-h3 font-semibold text-ink">
          {card.title}
        </h3>
        <p className="mt-1.5 text-sm text-ink-muted">{card.description}</p>
        {!card.comingSoon && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            Play
            <svg
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.25}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        )}
        {card.comingSoon && (
          <div className="mt-4 text-sm font-semibold text-ink-dim">
            In development
          </div>
        )}
      </div>
    </>
  );

  if (card.comingSoon) {
    return (
      <Card
        wash
        className="group relative overflow-hidden p-5 text-left cursor-default"
      >
        {inner}
      </Card>
    );
  }

  return (
    <Card
      as={Link}
      href={card.href}
      interactive
      wash
      className="group relative overflow-hidden p-5 text-left"
    >
      {inner}
    </Card>
  );
}

export function InteractiveTraining() {
  const sectionId = "interactive-training";
  return (
    <div aria-labelledby={sectionId}>
      <div className="max-w-[42rem]">
        <h2
          id={sectionId}
          className="text-h2 tracking-h2 font-semibold text-ink"
        >
          Interactive Cybersecurity Training
        </h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Practice cybersecurity skills with short browser games. Learn at your
          own pace. No sign-in required.
        </p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <TrainingCard key={game.title} card={game} />
        ))}
      </div>
    </div>
  );
}
