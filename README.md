# steamcommunity.monster

A fast, Cloudflare free-tier-first CS2 player intelligence page. Replace `steamcommunity.com` with `steamcommunity.monster`, or search by SteamID64, vanity name, or either supported profile URL. The canonical application key is SteamID64.

## Product behavior

The Worker resolves identity and queries independent adapters for Steam Web API, FACEIT Data API, Leetify public profile data, and only explicitly authorized partner APIs. Each result has an explicit status (`ok`, `not_found`, `not_configured`, `rate_limited`, `error`, or `external_only`), so one outage does not erase the rest of the page. Monster Consensus is a deterministic, attributed risk-signal summary. It is not a cheat verdict and never claims to be Valve Trust Factor.

## Run locally

Requirements: Node.js 22+ and a Wrangler-authenticated Cloudflare account only for live API/dev deployment.

```sh
npm run install:all
npm run dev:worker                         # localhost:8787
npm run dev:pages                          # Pages dev server
```

```powershell
Copy-Item .dev.vars.example worker/.dev.vars
```

On Unix-like shells:

```sh
cp .dev.vars.example worker/.dev.vars
```
## Checks

```sh
npm test
npm run lint
npm run check
```

The test suite mocks upstream APIs and does not need provider credentials.

## Deploy

`worker/wrangler.jsonc` is the source of truth. The custom Worker domain is `api.steamcommunity.monster`; Pages project is `steamcommunity-monster` and serves `pages/`.

For a one-time setup, export `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then run `npm run bootstrap:cloudflare`. It is idempotent, creates/binds D1 when permitted, creates the Pages project, applies migrations, deploys both surfaces, and attempts the Pages custom domain. Missing DNS ownership or token scopes are reported without deleting resources.

GitHub Actions runs tests, static checks, and Worker dry-run validation on pull requests. Pushes to `main` apply configured D1 migrations, deploy Worker and Pages, then smoke-test `/health`. Required repository secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. `npm run bootstrap:github` can set them from environment variables without printing values.

## Add an authorized provider

Provider definitions live in `worker/src/index.js` under `COMMUNITY_DEFS`. Add a documented API URL-template secret and optional bearer-token secret, return the shared result envelope, and document the access model in `docs/PROVIDERS.md`. Monster does not scrape sites or invent undocumented APIs. External-only links remain available through `/v1/tools/:steamid64`.

## API

- `GET /health`
- `GET /v1/providers`
- `GET /v1/player?input=...`
- `GET /v1/player/:steamid64`
- `GET /v1/history/:steamid64?limit=50`
- `GET /v1/tools/:steamid64`

Cache API stores canonical SteamID64 responses for 15 minutes by default; browser cache is 60 seconds. D1 snapshots are sparse, defaulting to one write per player per six hours. No traffic-scaled KV writes are used.

## Data and privacy

Only public profile and gameplay/provider fields needed for the page and optional sparse history are retained. Provider attribution and freshness are shown to users. Monster is not affiliated with Valve/Steam, FACEIT, Leetify, or listed community tools. See `docs/PROVIDERS.md`, `docs/ARCHITECTURE.md`, and `docs/ACCEPTANCE.md`.
