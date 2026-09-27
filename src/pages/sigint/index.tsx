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
import {
  Globe,
  Radar,
  Layers,
  Radio,
  Shield,
  Satellite,
  AlertTriangle,
  Newspaper,
  Eye,
  Flame,
  CloudLightning,
  Wind,
  Ship,
  Plane,
  Activity,
  Monitor,
  Lock,
  Github,
} from "lucide-react";
import Image from "next/image";
import { Meta, PageContainer } from "@/components";
import JsonLdScript from "@/components/JsonLdScript";
import { sigintProductLd, generateBreadCrumbJsonLd } from "@/lib/json-ld";
import { WaitlistForm } from "@/components/WaitlistForm";

/* ── tiny helpers ─────────────────────────────────────────────────── */
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-eyebrow font-semibold tracking-eyebrow uppercase text-accent mb-3">
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-h2 tracking-h2 font-semibold text-ink mb-4">
      {children}
    </h2>
  );
}

/* ── data source card ─────────────────────────────────────────────── */
type SourceCardProps = {
  icon: React.ReactNode;
  name: string;
  description: string;
  badge?: string;
  badgeColor?: string;
};

function SourceCard({
  icon,
  name,
  description,
  badge,
  badgeColor = "border border-sky-300/80 bg-sky-100/90 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/15 dark:text-sky-300",
}: SourceCardProps) {
  return (
    <div className="group relative flex items-start gap-4 overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border-accent bg-surface text-accent transition-transform group-hover:scale-110">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-ink">
            {name}
          </h3>
          {badge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ── capability card ──────────────────────────────────────────────── */
type CapCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function CapCard({ icon, title, description }: CapCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-card border border-hairline bg-surface bg-[image:var(--wash)] p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border-accent bg-surface text-accent transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-ink mb-2">
        {title}
      </h3>
      <p className="text-sm text-ink-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ── stat counter ─────────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-h2 tracking-h2 font-semibold text-accent font-mono">
        {value}
      </div>
      <div className="text-xs text-ink-muted mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

/* ── main page ────────────────────────────────────────────────────── */
export default function SigintPage() {
  return (
    <>
      <Meta
        title="SIGINT Dashboard | Self-Hosted Real-Time OSINT Platform"
        description="Explore a self-hosted OSINT dashboard for aircraft, vessels, earthquakes, fires, severe weather, tropical cyclones, events, and world news."
        image="https://www.wedefendit.com/sigint-og.png"
        imageAlt="SIGINT Dashboard showing a geospatial globe, alert log, intelligence feed, news, and video panes"
        url="https://www.wedefendit.com/sigint"
        canonical="https://www.wedefendit.com/sigint"
        keywords="self-hosted OSINT dashboard, real-time geospatial intelligence, aircraft tracking, AIS vessel tracking, earthquake monitoring, fire hotspot map, severe weather alerts, tropical cyclone tracking, GDELT events, correlation engine"
        structuredData={sigintProductLd}
      />
      <JsonLdScript
        jsonLd={generateBreadCrumbJsonLd({
          items: [{ name: "Home", href: "/" }, { name: "SIGINT Dashboard" }],
        })}
      />

      <PageContainer>
        <div className="w-full max-w-6xl mx-auto px-4 space-y-20 pb-16">
          {/* ── Hero ──────────────────────────────────────────────── */}
          <header className="text-center pt-4 px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium mb-6">
              <Radar className="w-3.5 h-3.5" />
              <span>OSINT project by Defend I.T. Solutions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-ink mb-3">
              <span className="text-accent">
                SIGINT Dashboard&trade;
              </span>
            </h1>

            <p className="text-xl sm:text-2xl md:text-4xl font-medium text-ink-muted mb-6">
              Real-Time OSINT, Organized
            </p>

            <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              SIGINT combines aircraft, vessel, earthquake, fire, weather,
              cyclone, event, and news feeds in one interface. Review the
              project demo or run the community edition on your own server.
            </p>

            <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-5">
              <a
                href="https://sigint.atropeano.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/85 bg-emerald-100/92 px-8 py-4 text-lg font-medium text-emerald-900 shadow-[0_12px_28px_rgba(16,185,129,0.16)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/90 hover:bg-emerald-100 hover:text-emerald-950 hover:shadow-[0_16px_34px_rgba(16,185,129,0.2)] dark:border-green-500/30 dark:bg-emerald-950/40 dark:text-green-300 dark:shadow-[0_14px_28px_rgba(16,185,129,0.14)] dark:hover:border-green-400 dark:hover:bg-emerald-950/55 dark:hover:text-green-200 dark:hover:shadow-[0_18px_34px_rgba(16,185,129,0.2)]"
              >
                <Globe className="w-5 h-5" />
                Open Project Demo
              </a>
              <a
                href="https://github.com/wedefendit/sigint"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-8 py-4 text-lg font-medium text-slate-800 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white hover:text-sky-800 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)] dark:border-slate-600 dark:bg-slate-950/78 dark:text-slate-200 dark:shadow-[0_14px_28px_rgba(2,6,23,0.22)] dark:hover:border-sky-400/28 dark:hover:bg-slate-900 dark:hover:text-sky-200"
              >
                <Github className="w-5 h-5" />
                View Source and Documentation
              </a>
            </div>

            {/* Hero screenshot */}
            <div className="relative rounded-lg overflow-hidden border border-hairline/50 shadow-2xl shadow-black/50">
              <Image
                src="/img/sigint/sigint-hero.png"
                alt="SIGINT Dashboard showing a globe, alert log, intelligence feed, news feed, and video panes"
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  SESSION VIEW
                </span>
                <span>Multiple data layers</span>
                <span>Source availability varies</span>
              </div>
            </div>
          </header>

          {/* ── Stats bar ─────────────────────────────────────────── */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-y border-hairline/50">
            <Stat value="8" label="Data Feeds" />
            <Stat value="2" label="Map Views" />
            <Stat value="8" label="Workspace Panes" />
            <Stat value="1" label="Self-Hosted App" />
          </section>

          {/* ── Data Sources ──────────────────────────────────────── */}
          <section>
            <div className="text-center mb-10">
              <SectionTag>Intelligence Sources</SectionTag>
              <SectionTitle>Eight Data Feeds. One Workspace.</SectionTitle>
              <p className="text-ink-muted max-w-2xl mx-auto">
                The dashboard organizes aircraft, vessel, earthquake, fire,
                weather, cyclone, event, and news data in one workspace. Source
                availability depends on upstream services and configuration.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <SourceCard
                icon={<Plane className="w-5 h-5" />}
                name="Aircraft Tracking"
                description="Server-proxied aircraft positions from adsb.fi, enriched with callsign, altitude, speed, heading, squawk code, aircraft details, and heuristic military classification."
                badge="FEED"
                badgeColor="bg-green-500/20 text-green-300"
              />
              <SourceCard
                icon={<Ship className="w-5 h-5" />}
                name="AIS Vessel Tracking"
                description="AIS vessel positions from aisstream.io, including MMSI, IMO, vessel type, flag, destination, and navigation status when available."
                badge="FEED"
                badgeColor="bg-green-500/20 text-green-300"
              />
              <SourceCard
                icon={<Activity className="w-5 h-5" />}
                name="Seismic Monitoring"
                description="USGS earthquake data from the past seven days, including magnitude, depth, tsunami status, and felt reports."
              />
              <SourceCard
                icon={<Flame className="w-5 h-5" />}
                name="Fire Detection"
                description="NASA FIRMS VIIRS fire hotspots with location, brightness, radiative power, and confidence data."
              />
              <SourceCard
                icon={<AlertTriangle className="w-5 h-5" />}
                name="Conflict and Crisis Events"
                description="GDELT 2.0 geolocated events covering conflict, protests, diplomacy, and other public activity in a rolling seven-day window."
              />
              <SourceCard
                icon={<CloudLightning className="w-5 h-5" />}
                name="Severe Weather Alerts"
                description="Active U.S. severe weather alerts from the National Weather Service, including severity, affected area, and start and end times."
              />
              <SourceCard
                icon={<Wind className="w-5 h-5" />}
                name="Tropical Cyclone Tracking"
                description="Active Atlantic, Eastern Pacific, and Central Pacific storms from the National Hurricane Center, with position, classification, wind, forecast track, cone, and advisory text."
              />
              <SourceCard
                icon={<Newspaper className="w-5 h-5" />}
                name="World News Aggregation"
                description="Six RSS news feeds place current reporting beside the geospatial data, alerts, and intelligence products."
              />
            </div>
          </section>

          {/* ── Capabilities ──────────────────────────────────────── */}
          <section id="capabilities">
            <div className="text-center mb-10">
              <SectionTag>Capabilities</SectionTag>
              <SectionTitle>
                From Raw Feeds to a Working View
              </SectionTitle>
              <p className="text-ink-muted max-w-2xl mx-auto">
                Use the globe, tables, dossiers, alerts, news, and video panes
                together. Correlation and scoring tools add context without
                hiding the underlying source data.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <CapCard
                icon={<Globe className="w-6 h-6" />}
                title="Interactive Globe and Flat Map"
                description="Switch between globe and flat-map projections, inspect recorded trails, and move from a global view to individual tracked items."
              />
              <CapCard
                icon={<Radar className="w-6 h-6" />}
                title="Correlation Engine"
                description="Compares events across time and location to create correlation products and context-scored alerts."
              />
              <CapCard
                icon={<Eye className="w-6 h-6" />}
                title="Anomaly Detection"
                description="Maintains seven-day regional baselines and raises context scores when current activity differs from recent patterns."
              />
              <CapCard
                icon={<Layers className="w-6 h-6" />}
                title="Multi-Pane Layout"
                description="Split, resize, move, minimize, and save layouts for the globe, data table, dossier, intelligence feed, alerts, video, news, and console."
              />
              <CapCard
                icon={<Monitor className="w-6 h-6" />}
                title="Live Video Monitoring"
                description="Play HLS news streams from the iptv-org directory in grids up to 3 by 3, with saved channel presets."
              />
              <CapCard
                icon={<Satellite className="w-6 h-6" />}
                title="Watch Mode"
                description="Cycle automatically through scored alerts or intelligence products while the related panes stay synchronized."
              />
              <CapCard
                icon={<Shield className="w-6 h-6" />}
                title="Entity Dossier"
                description="Open a tracked item to review available identity, route, telemetry, event details, images, and external source links."
              />
              <CapCard
                icon={<Radio className="w-6 h-6" />}
                title="Alert Scoring"
                description="Alerts receive a 1 to 10 composite score based on rule severity, regional context, correlations, and classification."
              />
              <CapCard
                icon={<Lock className="w-6 h-6" />}
                title="Protected API Routes"
                description="Server-backed data routes use HMAC-signed tokens in HttpOnly cookies and per-client rate limiting. Security headers apply to every response."
              />
            </div>
          </section>

          {/* ── Screenshots ───────────────────────────────────────── */}
          <section>
            <div className="text-center mb-10">
              <SectionTag>In Action</SectionTag>
              <SectionTitle>See the Workspace in Use</SectionTitle>
              <p className="text-ink-muted max-w-2xl mx-auto">
                These screenshots show captured project sessions. Counts and
                source availability vary by session.
              </p>
            </div>

            <div className="space-y-12">
              {/* Emergency detection */}
              <div className="grid md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-3 rounded-lg overflow-hidden border border-hairline/50 shadow-xl">
                  <Image
                    src="/img/sigint/sigint-emergency.png"
                    alt="SIGINT detecting a 7700 emergency squawk with trail tracking, dossier, and live video feeds"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-red-300/80 bg-red-100/90 px-2.5 py-1 text-xs font-bold text-red-700 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    EMERGENCY DETECTION
                  </div>
                  <h3 className="text-xl font-bold text-ink">
                    Emergency Squawk Alert
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    This captured session shows a 7700 emergency squawk. The
                    dashboard scores the alert, draws the recorded trail, and
                    opens available identity, telemetry, route, and source
                    links beside the video pane.
                  </p>
                </div>
              </div>

              {/* Hijack + trail */}
              <div className="grid md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-2 space-y-3 order-2 md:order-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/80 bg-violet-100/90 px-2.5 py-1 text-xs font-bold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300">
                    <Plane className="w-3.5 h-3.5" />
                    TRAIL TRACKING
                  </div>
                  <h3 className="text-xl font-bold text-ink">
                    Squawk 7500 Trail and Dossier
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    This session shows a 7500 squawk with recorded positions,
                    interpolated waypoints, aircraft details, route data when
                    available, and locate, focus, and isolation controls.
                  </p>
                </div>
                <div className="md:col-span-3 rounded-lg overflow-hidden border border-hairline/50 shadow-xl order-1 md:order-2">
                  <Image
                    src="/img/sigint/sigint-hijack-trail.png"
                    alt="SIGINT showing a squawk 7500 alert with a recorded aircraft trail and dossier"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* GDELT events */}
              <div className="grid md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-3 rounded-lg overflow-hidden border border-hairline/50 shadow-xl">
                  <Image
                    src="/img/sigint/sigint-gdelt.png"
                    alt="SIGINT showing a GDELT event beside map, alert, intelligence, and video panes"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/80 bg-sky-100/90 px-2.5 py-1 text-xs font-bold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300">
                    <Globe className="w-3.5 h-3.5" />
                    SITUATIONAL AWARENESS
                  </div>
                  <h3 className="text-xl font-bold text-ink">
                    Geospatial Events in Context
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    A selected GDELT event appears beside the globe, active
                    alerts, correlated items, news, and video panes. The layout
                    keeps the source event visible while related context is
                    reviewed.
                  </p>
                </div>
              </div>

              {/* Hijack dossier */}
              <div className="grid md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-2 space-y-3 order-2 md:order-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-100/90 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300">
                    <Eye className="w-3.5 h-3.5" />
                    ENTITY DOSSIER
                  </div>
                  <h3 className="text-xl font-bold text-ink">
                    Aircraft Details in One Pane
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    The dossier combines callsign, ICAO address, aircraft type,
                    registration, operator, available route information, current
                    telemetry, and links to external aircraft sources.
                  </p>
                </div>
                <div className="md:col-span-3 rounded-lg overflow-hidden border border-hairline/50 shadow-xl order-1 md:order-2">
                  <Image
                    src="/img/sigint/sigint-hijack-dossier.png"
                    alt="SIGINT aircraft dossier showing identity, telemetry, and route details"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Tech Stack ────────────────────────────────────────── */}
          <section className="rounded-2xl border border-slate-200/80 bg-white/72 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_60%)] px-6 py-10 shadow-[0_16px_34px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/58 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_62%)] dark:shadow-[0_20px_40px_rgba(2,6,23,0.32)] dark:ring-white/5">
            <div className="text-center mb-8">
              <SectionTag>Architecture</SectionTag>
              <SectionTitle>Designed for Self-Hosting</SectionTitle>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-ink mb-1">
                  Worker Rendering
                </div>
                <p className="text-xs text-ink-muted">
                  Canvas drawing runs in a Web Worker so mapping work stays off
                  the main interface thread.
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-ink mb-1">
                  Single Process
                </div>
                <p className="text-xs text-ink-muted">
                  One Bun process serves the interface and the server-backed
                  data routes.
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-ink mb-1">
                  Offline Review
                </div>
                <p className="text-xs text-ink-muted">
                  The PWA can open its cached shell and stored data offline.
                  Live feeds still require a connection.
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-ink mb-1">
                  Self-Hosted
                </div>
                <p className="text-xs text-ink-muted">
                  Run the community edition on your own infrastructure with
                  your own API keys and environment.
                </p>
              </div>
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────────── */}
          <section className="text-center py-12">
            <h2 className="text-h2 tracking-h2 font-semibold text-ink mb-4">
              Explore the SIGINT Project
            </h2>
            <p className="text-ink-muted max-w-xl mx-auto mb-8">
              Review the demo, browse the source and documentation, or join the
              project update list. Demo and data-source availability may vary
              during development.
            </p>
            <div className="max-w-lg mx-auto mb-6">
              <WaitlistForm />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://sigint.atropeano.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/85 bg-emerald-100/92 px-8 py-4 text-lg font-medium text-emerald-900 shadow-[0_12px_28px_rgba(16,185,129,0.16)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/90 hover:bg-emerald-100 hover:text-emerald-950 hover:shadow-[0_16px_34px_rgba(16,185,129,0.2)] dark:border-green-500/30 dark:bg-emerald-950/40 dark:text-green-300 dark:shadow-[0_14px_28px_rgba(16,185,129,0.14)] dark:hover:border-green-400 dark:hover:bg-emerald-950/55 dark:hover:text-green-200 dark:hover:shadow-[0_18px_34px_rgba(16,185,129,0.2)]"
              >
                <Globe className="w-5 h-5" />
                Open Project Demo
              </a>
              <a
                href="https://github.com/wedefendit/sigint"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-8 py-4 text-lg font-medium text-slate-800 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white hover:text-sky-800 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)] dark:border-slate-600 dark:bg-slate-950/78 dark:text-slate-200 dark:shadow-[0_14px_28px_rgba(2,6,23,0.22)] dark:hover:border-sky-400/28 dark:hover:bg-slate-900 dark:hover:text-sky-200"
              >
                <Github className="w-5 h-5" />
                View Source and Documentation
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </>
  );
}
