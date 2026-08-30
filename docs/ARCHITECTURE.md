# Architecture

## Request flow

1. Pages serves the static `pages/` application and rewrites profile paths to `index.html`.
2. The Worker validates the input host/path and resolves vanity names through Steam only when `STEAM_API_KEY` is configured.
3. Direct SteamID64 requests use a canonical Cache API key. A hit returns immediately with a short browser cache header.
4. Steam, FACEIT lookup, and Leetify run in the first bounded wave. FACEIT detail calls follow lookup; authorized community adapters run sequentially to stay under Cloudflare outbound-connection limits.
5. Results use the provider envelope and are merged into a response with Monster Consensus, tools, timing, and optional stale D1 fallback.
6. Successful responses are cached at the edge. D1 writes happen in `ctx.waitUntil` and are throttled per player.

## Boundaries

- `worker/src/index.js`: routing, validation, adapters, normalization, consensus, caching, D1.
- `worker/migrations/`: sparse snapshot schema.
- `pages/`: no framework; escaped HTML templates and static security headers.
- `scripts/`: idempotent Cloudflare and GitHub setup helpers.

Steam ban fields are factual upstream state. Community reputation and risk values remain provider-attributed. Monster Consensus is a transparent deterministic estimate, never Valve Trust Factor.

## Free-tier controls

Cache keys use canonical SteamID64, cache TTL defaults to 900 seconds, browser max-age defaults to 60 seconds, all upstream calls have timeouts, history is bounded to 100 rows, and snapshots default to a six-hour interval. D1 is optional; a missing binding does not break live lookups.
