# Acceptance checklist

- [x] Steam `.com` and `.monster` profile paths resolve to canonical SteamID64 input.
- [x] Direct SteamID64, vanity names, and malicious/unrelated URL hosts are validated.
- [x] Steam, FACEIT, Leetify, and authorized partner responses have explicit independent statuses.
- [x] FACEIT, Leetify, and Steam fields are normalized defensively when optional fields are absent.
- [x] Monster Consensus is deterministic, attributed, bounded, and explicitly not Valve Trust Factor.
- [x] External community links are generated from canonical SteamID64 and labeled external-only.
- [x] Cache API uses canonical IDs; browser and edge TTLs are separate; upstream calls timeout.
- [x] D1 history is optional, indexed, bounded, and snapshot writes are throttled.
- [x] Frontend escapes external values and ships CSP/security headers.
- [x] CI validates tests, syntax, Wrangler dry-run, and deploys only from `main`.
- [x] Bootstrap scripts avoid secret output and avoid deleting Cloudflare resources.
- [x] No provider API is claimed without configured authorized access.

Runtime credentials and DNS/custom-domain ownership are deployment prerequisites, not repository changes.
