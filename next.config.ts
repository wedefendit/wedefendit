import type { NextConfig } from "next";

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

// Deny every privileged browser feature except clipboard-write, which the
// "copy" buttons (CopyableCode) use. The CSP above is intentionally left as-is:
// Leaflet + reCAPTCHA require style-src 'unsafe-inline' and the google/tile
// origins, so it is not tightened further here.
const permissionsPolicy = [
  "accelerometer=()",
  "ambient-light-sensor=()",
  "autoplay=()",
  "battery=()",
  "bluetooth=()",
  "camera=()",
  "clipboard-read=()",
  "clipboard-write=(self)",
  "display-capture=()",
  "encrypted-media=()",
  "fullscreen=()",
  "gamepad=()",
  "geolocation=()",
  "gyroscope=()",
  "hid=()",
  "idle-detection=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "picture-in-picture=()",
  "publickey-credentials-get=()",
  "screen-wake-lock=()",
  "serial=()",
  "usb=()",
  "web-share=()",
  "xr-spatial-tracking=()",
].join(", ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: permissionsPolicy },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    useTypeScriptCli: false,
  },
  headers() {
    return Promise.resolve([
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]);
  },
};

export default nextConfig;
