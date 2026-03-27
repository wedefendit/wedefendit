// next.config.ts

/** @type {import('next').NextConfig} */

const tileOrigins =
  "https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org";

const csp = [
  "default-src 'self'",
  `img-src 'self' data: blob: ${tileOrigins} https://unpkg.com https://www.gstatic.com`,
  "script-src 'self' https://www.google.com https://www.gstatic.com",
  "script-src-elem 'self' https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-src 'self' https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `connect-src 'self' ${tileOrigins} https://www.google.com`,
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
