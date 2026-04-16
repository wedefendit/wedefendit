# GRIDRUNNER — Asset Security & Loading Architecture

**Status:** Design
**Owner:** Anthony Tropeano / Defend I.T. Solutions LLC
**Created:** 2026-04-16

## Goals

1. **Integrity** — detect if any asset (public or protected) has been tampered with in transit, in cache, or on disk
2. **Cache efficiency** — assets cached forever in the browser, automatic invalidation on change
3. **Protect commercial music** — Karl Casey tracks must not be downloadable as direct files
4. **Lazy loading** — game assets fetched on game entry via the loading screen, not bundled with the main app
5. **Audit trail** — every asset's provenance is verifiable

## Asset Classification

| Tier                   | Examples                            | Public? | Signed? | Hashed?              |
| ---------------------- | ----------------------------------- | ------- | ------- | -------------------- |
| **Tier 1 — Public**    | SFX, sprites, fonts, JSON game data | Yes     | No      | Yes                  |
| **Tier 2 — Protected** | Karl Casey music tracks             | No      | Yes     | Yes                  |
| **Tier 3 — Code**      | JS bundles, CSS                     | Yes     | No      | Yes (Next.js native) |

## Hashing Strategy

### What gets hashed

**Everything.** SFX, music, sprites, fonts, JSON, even icons. No exceptions.

### How

Build-time script (`scripts/hash-assets.ts`) runs as part of `next build`:

1. Walk every file under `public/audio/`, `public/sprites/`, `public/fonts/`, `public/data/`, and `private/audio/`
2. Compute SHA-256 of file contents
3. Rename file: `hit.wav` → `hit.a3f8b2c4d9e1f6a8.wav` (first 16 hex chars of SHA-256)
4. Write `manifest.json`:
   ```json
   {
     "version": "2026.04.16.0142",
     "generated": "2026-04-16T01:42:00Z",
     "assets": {
       "audio/sfx/hit/SCIMech_Mech_Processed_Metal_27.wav": {
         "hashed": "audio/sfx/hit/SCIMech_Mech_Processed_Metal_27.a3f8b2c4d9e1f6a8.wav",
         "sha256": "a3f8b2c4d9e1f6a8...full-64-char-hash",
         "size": 184320,
         "tier": 1
       },
       "audio/music/overworld/malibu_moon.mp3": {
         "hashed": "music/8b3a91c2f4d7e6a5.mp3",
         "sha256": "8b3a91c2f4d7e6a5...full-64-char-hash",
         "size": 4823104,
         "tier": 2
       }
     }
   }
   ```
5. Sign the manifest itself (HMAC-SHA256 with server secret) and serve a separate `manifest.sig` for verification

### Cache headers

- Hashed files: `Cache-Control: public, max-age=31536000, immutable`
- Manifest: `Cache-Control: no-cache, must-revalidate` (always check freshness)

### Why short hash in filename, full hash in manifest

- Filename hash (16 chars) = cache buster, collision-safe enough for asset count
- Manifest hash (64 chars) = full SHA-256 for integrity verification

## Tier 1 — Public Assets (SFX, sprites, etc.)

### Serving

Static files served by Next.js / CDN from `public/`. No API routes, no token checks. Just hashed filenames + immutable cache headers.

### Integrity verification

Frontend verifies on load:

```ts
const expected = manifest.assets["audio/sfx/hit/SCIMech_Metal_27.wav"].sha256;
const buf = await fetch(hashedUrl).then((r) => r.arrayBuffer());
const actual = await sha256Hex(buf);
if (actual !== expected) throw new Error("Asset integrity failure");
```

If a CDN edge has been compromised or a cache layer has corrupted bytes, the hash check catches it before we play/render the asset.

## Tier 2 — Protected Assets (Karl Casey music)

### Storage

- Files live in `private/audio/music/` — **outside** `public/`
- Files are renamed to opaque hashes (`8b3a91c2f4d7e6a5.mp3`) — no human-readable names anywhere on disk
- Mapping from logical name → hashed file lives only in the manifest, which is server-side authoritative

### Access flow

```
1. Client enters game → POST /api/session/start
   → Server creates session JWT (15 min TTL, signed with server secret)
   → JWT payload: { sessionId, expiresAt, allowedTiers: [1, 2] }
   → Returned in HttpOnly cookie

2. Client needs music track "overworld"
   → GET /api/audio/music/overworld
   → Headers: Cookie (JWT), Referer (must be wedefendit.com)
   → Server validates: JWT signature, JWT expiry, Referer host
   → Server reads manifest, finds hashed filename
   → Server streams file with Content-Type: audio/mpeg
   → No redirect to a public URL — file served from API route directly

3. Client plays via Web Audio API
   → const buf = await fetch("/api/audio/music/overworld").then(r => r.arrayBuffer())
   → const decoded = await audioCtx.decodeAudioData(buf)
   → Verify SHA-256 against manifest before playing
   → Play decoded buffer

4. Browser caches the response
   → Cache-Control: private, max-age=900 (15 min, matches session)
   → On next play, browser may serve from cache (fast)
   → On cache miss after expiry, client requests new session token first
```

### Why streaming directly through API instead of signed S3 URL

- No public URL ever exists for the protected file
- Even with devtools open, the URL the user sees is `/api/audio/music/overworld`, not the actual file path
- Determined attacker can still capture the byte stream from devtools — that's an unsolvable problem in a browser without DRM, and not worth solving for indie game music
- Stops 99.9% of casual download attempts and 100% of hot-linking

### Rate limiting

API route applies per-session rate limit (e.g., 60 audio fetches per 15 min per session). Stops scripted scraping.

## Tier 3 — Code Bundles

Next.js handles this natively:

- JS/CSS hashed in filename (`_next/static/chunks/[hash].js`)
- Long-lived cache headers
- Subresource Integrity (SRI) hashes on `<script>` tags via Next.js config

Add: enable SRI for production builds in `next.config.js`:

```js
experimental: {
  sri: {
    algorithm: "sha256";
  }
}
```

## Loading Screen Flow

When user enters `/awareness/gridrunner/`:

```
1. Render loading screen UI immediately (already in main bundle, ~5KB)
2. POST /api/session/start → session JWT cookie set
3. GET /manifest.json + /manifest.sig → verify signature
4. Determine assets needed for current zone (e.g., starting in Arcade):
   - All SFX (~15 files, ~2 MB total)
   - Arcade music track
   - Arcade sprite tileset
   - Player sprite
   - Fonts (Orbitron, Share Tech Mono)
5. Fetch each asset in parallel with progress callback
6. Verify SHA-256 of each as it loads
7. Update progress bar: "Loading 12 / 18 assets..."
8. When done, transition from loading screen to title screen
```

Subsequent zone entries fetch only the new zone's music + sprites; SFX already in memory.

## Build Pipeline

```
npm run build:
  1. scripts/hash-assets.ts
     - Walk public/ + private/
     - Hash, rename, generate manifest.json
     - Sign manifest with HMAC → manifest.sig
  2. next build
     - Standard Next.js build
     - SRI hashes for code bundles
  3. Verify build:
     - scripts/verify-build.ts
     - Re-hash every file in build output
     - Compare to manifest
     - Fail build if any mismatch
```

CI ensures `manifest.json` is committed and matches the actual build output. Any drift fails the deploy.

## Tampering Detection

### At build time

Build verification step (above) catches accidental file corruption before deploy.

### At runtime (server)

Optional: cron job hashes all served files every hour, compares to manifest. Alert on mismatch (someone accessed the server and modified a file).

### At runtime (client)

Every asset load verifies SHA-256 against manifest before use. Mismatch = immediate failure, no retry, log to telemetry.

### Manifest itself

- Manifest signed with server-side HMAC key
- Client verifies signature on load
- If manifest is tampered, signature fails → entire game refuses to load
- HMAC key rotation: monthly, or on any incident

## Secrets Management

| Secret               | Purpose                                             | Where          |
| -------------------- | --------------------------------------------------- | -------------- |
| `MANIFEST_HMAC_KEY`  | Signs manifest.json                                 | Server env var |
| `SESSION_JWT_SECRET` | Signs session JWTs                                  | Server env var |
| `MUSIC_FILE_KEY`     | (Optional) AES key if we ever encrypt files at rest | Server env var |

All secrets live in environment variables, never in code, never in git.

## What We Are NOT Protecting Against

Be honest about the threat model:

1. **Determined reverse engineers extracting music via devtools network capture** — unsolvable in a browser without DRM. Not worth chasing.
2. **Users who go to Karl Casey's YouTube and yt-dlp the original** — out of scope, that's his channel's choice.
3. **Nation-state attackers** — not the threat model for an indie awareness game.

## What We ARE Protecting Against

1. **Hot-linking** — someone embedding `wedefendit.com/music/boss.mp3` in their site. Signed URLs + Referer checks block this completely.
2. **Casual download** — a user right-clicking a music player to "save audio as." Streaming through API with no direct URL blocks this.
3. **CDN cache poisoning** — bad actor serves modified asset from a CDN edge. Hash verification catches this.
4. **Compromised dependencies** — npm package serves modified asset bundled with itself. SRI on code bundles catches this.
5. **Server compromise** — attacker swaps a music file. Manifest hash mismatch catches this on next client load.

## Implementation Order

1. Write `scripts/hash-assets.ts` and integrate into build
2. Write manifest signer + verifier
3. Move music files to `private/audio/music/`, hash them
4. Build `/api/session/start` + JWT handling
5. Build `/api/audio/music/[id]` route
6. Build client-side asset loader with hash verification
7. Wire loading screen to real progress
8. Wire audio engine to load via the new system
9. Enable SRI in next.config
10. Add build verification step

## Open Questions

1. Where do we store the HMAC and JWT secrets in production? (Recommend: deployed via env vars from a secrets manager — Doppler, 1Password, or env file managed outside git)
2. Do we want a CSP report-uri to catch SRI failures in the wild?
3. Does the music need to be encrypted at rest on the server, or is filesystem permissions enough? (Recommend: filesystem perms only — encryption at rest doesn't add real protection if the server is compromised)
4. Telemetry endpoint for client-side hash failures — build it now or defer?
