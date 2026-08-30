# Providers

The API envelope is:

```json
{"id":"steam","name":"Steam Web API","status":"ok","fetchedAt":"...","profileUrl":"https://...","metrics":{},"data":{},"raw":null}
```

Statuses are `ok`, `not_found`, `not_configured`, `rate_limited`, `error`, and `external_only`. `durationMs` and `error` are diagnostic fields. Credentials are never returned.

## Integrated adapters

- **Steam Web API**: profile summary, visibility, account age, Steam level, CS2 playtime, and ban fields. Requires `STEAM_API_KEY`.
- **FACEIT Data API**: CS2 identity, verified state, region, level, ELO, lifetime stats, recent matches, and bans. Requires `FACEIT_API_KEY`.
- **Leetify public profile API**: ranks, ratings, stats, recent matches, and platform bans where returned. Uses public access by default and `LEETIFY_API_KEY` when available.
- **Community adapter slots**: CSRep, CSStats.gg, CSTracker.gg, CS2Tracker.gg, TrustFactor.gg, TrackBans, CSWatch, cs.ninja, CSSurf, CCStats, nextpeek, CS2TrustFactor, Nohax.club, AIMTRACER, ChromeStats, CSRun, csst.at, player.properties, Scope.gg, FaceitTracker, Faceit Finder, FaceitAnalyser, BO5 FACEIT Finder, JumpThrow Player Finder, CSDB.gg, VacList, vac-ban.com, SteamHistory, SteamID.uk, CSXP, SteamSets, SkinsValue, CS2Locker, and CSFloat.

Community slots activate only when an authorized `*_API_URL_TEMPLATE` is configured. Templates must contain `{steamid}`. Optional bearer keys are named by the matching `*_API_KEY`. The Worker does not scrape or imply an API exists.

## External-only links

`GET /v1/tools/:steamid64` always returns canonical links for Steam, Leetify, FACEIT, CSStats, CSTracker, CSRep, CSXP, VacList, TrackBans, SteamHistory, SteamID.uk, Scope, Tracker.gg, CSFloat, and SteamLadder. These links are labeled external in the UI and are not represented as integrated data.

Third-party trust, risk, or reputation scores are community/provider signals. Valve's private Trust Factor is not publicly exposed and is never claimed by this product.
