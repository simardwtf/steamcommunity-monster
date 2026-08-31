const STEAM_API = 'https://api.steampowered.com';
const FACEIT_API = 'https://open.faceit.com/data/v4';
const LEETIFY_API = 'https://api-public.cs-prod.leetify.com';
const DEFAULT_CACHE_TTL = 900;
const DEFAULT_SNAPSHOT_INTERVAL = 21600;
const MAX_HISTORY = 100;
const CORE_PROVIDER_NAMES = { steam: 'Steam Web API', faceit: 'FACEIT Data API', leetify: 'Leetify Public API' };

const EXTERNAL_TOOLS = [
  ['steam', 'Steam', 'Official profile', id => `https://steamcommunity.com/profiles/${id}`],
  ['leetify', 'Leetify', 'Advanced analytics', id => `https://leetify.com/app/profile/${id}`],
  ['faceit', 'FACEIT', 'Matches and ELO', id => `https://www.faceit.com/en/players/${id}`],
  ['csstats', 'CSStats.gg', 'Match history', id => `https://csstats.gg/player/${id}`],
  ['cstracker', 'CSTracker.gg', 'Round analytics', id => `https://cstracker.gg/player/${id}`],
  ['csrep', 'CSRep', 'Community reputation', () => 'https://csrep.gg/'],
  ['csxp', 'CSXP', 'Medals and collectibles', id => `https://csxp.gg/players/${id}`],
  ['vaclist', 'VacList', 'Ban history', () => 'https://vaclist.net/'],
  ['trackbans', 'TrackBans', 'Ban tracking', () => 'https://trackbans.com/'],
  ['steamhistory', 'SteamHistory', 'Steam history', id => `https://steamhistory.net/id/${id}`],
  ['steamiduk', 'SteamID.uk', 'Steam identifiers', id => `https://steamid.uk/profile/${id}`],
  ['scope', 'Scope.gg', 'CS2 analytics', id => `https://scope.gg/l/${id}`],
  ['tracker', 'Tracker.gg', 'Game tracker', id => `https://tracker.gg/steam/profile/${id}`],
  ['csfloat', 'CSFloat', 'Inventory and market', () => 'https://csfloat.com/'],
  ['steamladder', 'SteamLadder', 'Profile statistics', id => `https://steamladder.com/profile/${id}/`]
];

const COMMUNITY_DEFS = [
  ['csrep', 'CSRep', 'CSREP_API_URL_TEMPLATE', 'CSREP_API_KEY'],
  ['csstats', 'CSStats.gg', 'CSSTATS_API_URL_TEMPLATE', 'CSSTATS_API_KEY'],
  ['cstracker', 'CSTracker.gg', 'CSTRACKER_API_URL_TEMPLATE', 'CSTRACKER_API_KEY'],
  ['cs2tracker', 'CS2Tracker.gg', 'CS2TRACKER_API_URL_TEMPLATE', 'CS2TRACKER_API_KEY'],
  ['trustfactor', 'TrustFactor.gg', 'TRUSTFACTOR_API_URL_TEMPLATE', 'TRUSTFACTOR_API_KEY'],
  ['trackbans', 'TrackBans', 'TRACKBANS_API_URL_TEMPLATE', 'TRACKBANS_API_KEY'],
  ['cswatch', 'CSWatch', 'CSWATCH_API_URL_TEMPLATE', 'CSWATCH_API_KEY'],
  ['csninja', 'cs.ninja', 'CSNINJA_API_URL_TEMPLATE', 'CSNINJA_API_KEY'],
  ['cssurf', 'CSSurf', 'CSSURF_API_URL_TEMPLATE', 'CSSURF_API_KEY'],
  ['ccstats', 'CCStats', 'CCSTATS_API_URL_TEMPLATE', 'CCSTATS_API_KEY'],
  ['nextpeek', 'nextpeek', 'NEXTPEEK_API_URL_TEMPLATE', 'NEXTPEEK_API_KEY'],
  ['cs2trustfactor', 'CS2TrustFactor', 'CS2TRUSTFACTOR_API_URL_TEMPLATE', 'CS2TRUSTFACTOR_API_KEY'],
  ['nohax', 'Nohax.club', 'NOHAX_API_URL_TEMPLATE', 'NOHAX_API_KEY'],
  ['aimtracer', 'AIMTRACER', 'AIMTRACER_API_URL_TEMPLATE', 'AIMTRACER_API_KEY'],
  ['chromestats', 'ChromeStats', 'CHROMESTATS_API_URL_TEMPLATE', 'CHROMESTATS_API_KEY'],
  ['csrun', 'CSRun', 'CSRUN_API_URL_TEMPLATE', 'CSRUN_API_KEY'],
  ['csstat', 'csst.at', 'CSSTAT_API_URL_TEMPLATE', 'CSSTAT_API_KEY'],
  ['playerproperties', 'player.properties', 'PLAYERPROPERTIES_API_URL_TEMPLATE', 'PLAYERPROPERTIES_API_KEY'],
  ['scope', 'Scope.gg', 'SCOPE_API_URL_TEMPLATE', 'SCOPE_API_KEY'],
  ['faceittracker', 'FaceitTracker', 'FACEITTRACKER_API_URL_TEMPLATE', 'FACEITTRACKER_API_KEY'],
  ['faceitfinder', 'Faceit Finder', 'FACEITFINDER_API_URL_TEMPLATE', 'FACEITFINDER_API_KEY'],
  ['faceitanalyser', 'FaceitAnalyser', 'FACEITANALYSER_API_URL_TEMPLATE', 'FACEITANALYSER_API_KEY'],
  ['bo5faceitfinder', 'BO5 FACEIT Finder', 'BO5FACEITFINDER_API_URL_TEMPLATE', 'BO5FACEITFINDER_API_KEY'],
  ['jumpthrow', 'JumpThrow Player Finder', 'JUMPTHROW_API_URL_TEMPLATE', 'JUMPTHROW_API_KEY'],
  ['csdb', 'CSDB.gg', 'CSDB_API_URL_TEMPLATE', 'CSDB_API_KEY'],
  ['vaclist', 'VacList', 'VACLIST_API_URL_TEMPLATE', 'VACLIST_API_KEY'],
  ['vacban', 'vac-ban.com', 'VACBAN_API_URL_TEMPLATE', 'VACBAN_API_KEY'],
  ['steamhistory', 'SteamHistory', 'STEAMHISTORY_API_URL_TEMPLATE', 'STEAMHISTORY_API_KEY'],
  ['steamiduk', 'SteamID.uk', 'STEAMIDUK_API_URL_TEMPLATE', 'STEAMIDUK_API_KEY'],
  ['csxp', 'CSXP', 'CSXP_API_URL_TEMPLATE', 'CSXP_API_KEY'],
  ['steamsets', 'SteamSets', 'STEAMSETS_API_URL_TEMPLATE', 'STEAMSETS_API_KEY'],
  ['skinsvalue', 'SkinsValue', 'SKINSVALUE_API_URL_TEMPLATE', 'SKINSVALUE_API_KEY'],
  ['cs2locker', 'CS2Locker', 'CS2LOCKER_API_URL_TEMPLATE', 'CS2LOCKER_API_KEY'],
  ['csfloat', 'CSFloat', 'CSFLOAT_API_URL_TEMPLATE', 'CSFLOAT_API_KEY']
];

class InputError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), request, env);
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, request, env);
    try {
      if (url.pathname === '/health') return json(health(env), 200, request, env);
      if (url.pathname === '/v1/providers') return json(providerConfig(env), 200, request, env);
      if (url.pathname === '/v1/player') {
        const input = url.searchParams.get('input');
        if (!input) return json({ error: 'Missing input' }, 400, request, env);
        return cors(await playerResponse(input, request, env, ctx), request, env);
      }
      const playerMatch = url.pathname.match(/^\/v1\/player\/(\d+)$/);
      if (playerMatch) return cors(await playerResponse(playerMatch[1], request, env, ctx), request, env);
      const historyMatch = url.pathname.match(/^\/v1\/history\/([^/]+)$/);
      if (historyMatch) return cors(await historyResponse(historyMatch[1], url, env), request, env);
      const toolsMatch = url.pathname.match(/^\/v1\/tools\/([^/]+)$/);
      if (toolsMatch) return json(toolsResponse(toolsMatch[1]), 200, request, env);
      return json({ error: 'Not found' }, 404, request, env);
    } catch (error) {
      const status = error instanceof InputError ? error.status : 500;
      return json({ error: safeError(error) }, status, request, env);
    }
  }
};

function health(env) {
  return { ok: true, service: 'steamcommunity.monster-api', providers: providerConfig(env), d1: !!env.DB, now: new Date().toISOString() };
}

function providerConfig(env) {
  const community = Object.fromEntries(COMMUNITY_DEFS.map(([id, name, template]) => [id, {
    id, name, status: env[template] ? 'configured' : 'external_only', integrated: !!env[template]
  }]));
  return {
    core: {
      steam: { id: 'steam', name: CORE_PROVIDER_NAMES.steam, status: env.STEAM_API_KEY ? 'configured' : 'not_configured' },
      faceit: { id: 'faceit', name: CORE_PROVIDER_NAMES.faceit, status: env.FACEIT_API_KEY ? 'configured' : 'not_configured' },
      leetify: { id: 'leetify', name: CORE_PROVIDER_NAMES.leetify, status: env.LEETIFY_API_KEY ? 'configured' : 'public' }
    },
    community
  };
}

async function playerResponse(input, request, env, ctx) {
  const identity = parseInput(input);
  let steamid = identity.steamid;
  if (!steamid) {
    if (!env.STEAM_API_KEY) throw new InputError('Vanity resolution requires STEAM_API_KEY', 503);
    steamid = await resolveVanity(identity.vanity, env);
  }
  if (!isSteamId64(steamid)) throw new InputError('Could not resolve a valid SteamID64', 404);

  const cacheTtl = positiveInt(env.CACHE_TTL_SECONDS, DEFAULT_CACHE_TTL);
  const cacheKey = new Request(`https://cache.steamcommunity.monster/v1/player/${steamid}`, { method: 'GET' });
  const forceRefresh = new URL(request.url).searchParams.get('refresh') === '1';
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit && !forceRefresh) {
    const body = await hit.json();
    body.cached = true;
    return jsonRaw(body, 200, { 'Cache-Control': 'public, max-age=60' });
  }

  const [steam, faceitLookup, leetify] = await Promise.all([
    getSteamBundle(steamid, env), getFaceitPlayer(steamid, env), getLeetify(steamid, env)
  ]);
  const faceit = faceitLookup;
  const community = await getCommunityProviders(steamid, env);
  let result = {
    steamid, requested: identity, fetchedAt: new Date().toISOString(), cached: false,
    providers: { steam, faceit, leetify, community },
    steam, faceit, leetify, community,
    consensus: calculateConsensus({ steam, faceit, leetify, community }),
    tools: toolsResponse(steamid).tools
  };

  if (env.DB && steam.status !== 'ok') {
    const previous = await loadLatestSnapshot(steamid, env);
    if (previous) result.fallback = { ...previous, stale: true };
  }
  if (env.DB && steam.status === 'ok') ctx.waitUntil(maybeStoreSnapshot(result, env));

  const cacheResponse = jsonRaw(result, 200, { 'Cache-Control': `public, max-age=${cacheTtl}` });
  ctx.waitUntil(cache.put(cacheKey, cacheResponse.clone()));
  return jsonRaw(result, 200, { 'Cache-Control': 'public, max-age=60' });
}

function parseInput(input) {
  let raw = String(input || '').trim();
  if (!raw) throw new InputError('Input is required');
  if (isSteamId64(raw)) return { steamid: raw, kind: 'steamid64' };
  if (!/^https?:\/\//i.test(raw) && /steamcommunity\.(com|monster)\//i.test(raw)) raw = `https://${raw}`;
  if (/^https?:\/\//i.test(raw)) {
    let u;
    try { u = new URL(raw); } catch { throw new InputError('Invalid profile URL'); }
    const host = u.hostname.toLowerCase();
    if (!['steamcommunity.com', 'www.steamcommunity.com', 'steamcommunity.monster', 'www.steamcommunity.monster'].includes(host)) throw new InputError('Only Steam Community or steamcommunity.monster profile URLs are accepted');
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length !== 2) throw new InputError('URL must be a Steam /id/<vanity> or /profiles/<steamid64> path');
    const segment = decodeSegment(parts[1]);
    if (parts[0].toLowerCase() === 'profiles' && isSteamId64(segment)) return { steamid: segment, kind: 'profile-url' };
    if (parts[0].toLowerCase() === 'id' && /^[A-Za-z0-9_-]{2,64}$/.test(segment)) return { vanity: segment, kind: 'vanity-url' };
    throw new InputError('URL is not a valid Steam profile path');
  }
  if (/^\d+$/.test(raw)) throw new InputError('Unsupported profile input');
  if (/^[A-Za-z0-9_-]{2,64}$/.test(raw)) return { vanity: raw, kind: 'vanity' };
  throw new InputError('Unsupported profile input');
}

async function resolveVanity(vanity, env) {
  const u = apiUrl(`${STEAM_API}/ISteamUser/ResolveVanityURL/v1/`, { key: env.STEAM_API_KEY, vanityurl: vanity });
  const data = await fetchJson(u, {}, 7000);
  return data?.response?.success === 1 ? data.response.steamid : null;
}

async function getSteamBundle(steamid, env) {
  if (!env.STEAM_API_KEY) return providerResult('steam', CORE_PROVIDER_NAMES.steam, 'not_configured', { profileUrl: steamProfile(steamid) });
  const started = Date.now();
  try {
    const common = { key: env.STEAM_API_KEY, steamid };
    const [summaryRaw, bansRaw, gamesRaw, levelRaw] = await Promise.all([
      fetchJson(apiUrl(`${STEAM_API}/ISteamUser/GetPlayerSummaries/v2/`, { key: env.STEAM_API_KEY, steamids: steamid }), {}, 7000),
      fetchJson(apiUrl(`${STEAM_API}/ISteamUser/GetPlayerBans/v1/`, { key: env.STEAM_API_KEY, steamids: steamid }), {}, 7000),
      fetchJson(apiUrl(`${STEAM_API}/IPlayerService/GetOwnedGames/v1/`, { ...common, include_appinfo: '1', include_played_free_games: '1', 'appids_filter[0]': '730' }), {}, 7000),
      fetchJson(apiUrl(`${STEAM_API}/IPlayerService/GetSteamLevel/v1/`, common), {}, 7000).catch(() => null)
    ]);
    const p = summaryRaw?.response?.players?.[0];
    if (!p) return providerResult('steam', CORE_PROVIDER_NAMES.steam, 'not_found', { durationMs: Date.now() - started });
    const b = bansRaw?.players?.[0] || {};
    const cs2 = gamesRaw?.response?.games?.find(g => Number(g.appid) === 730);
    return providerResult('steam', CORE_PROVIDER_NAMES.steam, 'ok', {
      durationMs: Date.now() - started, profileUrl: p.profileurl || steamProfile(steamid), data: {
        name: p.personaname, realName: p.realname || null, profileUrl: p.profileurl || steamProfile(steamid),
        avatar: p.avatarfull || p.avatarmedium || p.avatar || null, avatarFull: p.avatarfull || null,
        country: p.loccountrycode || null, stateCode: p.locstatecode || null, timeCreated: p.timecreated || null,
        visibility: p.communityvisibilitystate === 3 ? 'Public' : p.communityvisibilitystate === 1 ? 'Private' : `State ${p.communityvisibilitystate ?? 'unknown'}`,
        steamLevel: levelRaw?.response?.player_level ?? null, cs2PlaytimeMinutes: cs2?.playtime_forever ?? null,
        cs2Playtime2WeeksMinutes: cs2?.playtime_2weeks ?? null,
        bans: { vacBans: b.NumberOfVACBans ?? 0, gameBans: b.NumberOfGameBans ?? 0, daysSinceLastBan: b.DaysSinceLastBan ?? null, communityBanned: !!b.CommunityBanned, economyBan: b.EconomyBan || 'none', vacBanned: !!b.VACBanned }
      }
    });
  } catch (e) { return providerResult('steam', CORE_PROVIDER_NAMES.steam, classifyError(e), { durationMs: Date.now() - started, error: `Steam: ${safeError(e)}` }); }
}

async function getFaceitPlayer(steamid, env) {
  if (!env.FACEIT_API_KEY) return providerResult('faceit', CORE_PROVIDER_NAMES.faceit, 'not_configured', { profileUrl: `https://www.faceit.com/en/players/${steamid}` });
  const started = Date.now();
  try {
    const p = await fetchJson(apiUrl(`${FACEIT_API}/players`, { game: 'cs2', game_player_id: steamid }), faceitHeaders(env), 7000);
    if (!p?.player_id) return providerResult('faceit', CORE_PROVIDER_NAMES.faceit, 'not_found', { durationMs: Date.now() - started });
    return await getFaceitBundle(p, env, started);
  } catch (e) { return providerResult('faceit', CORE_PROVIDER_NAMES.faceit, classifyError(e), { durationMs: Date.now() - started, error: `FACEIT: ${safeError(e)}` }); }
}

async function getFaceitBundle(player, env, started = Date.now()) {
  try {
    const id = player.player_id;
    const [stats, history, bans] = await Promise.all([
      fetchJson(`${FACEIT_API}/players/${id}/stats/cs2`, faceitHeaders(env), 7000).catch(() => null),
      fetchJson(apiUrl(`${FACEIT_API}/players/${id}/history`, { game: 'cs2', offset: 0, limit: 10 }), faceitHeaders(env), 7000).catch(() => null),
      fetchJson(apiUrl(`${FACEIT_API}/players/${id}/bans`, { offset: 0, limit: 100 }), faceitHeaders(env), 7000).catch(() => null)
    ]);
    const game = player.games?.cs2 || {};
    const lifetime = stats?.lifetime || {};
    const recentMatches = (history?.items || []).map(m => ({ matchId: m.match_id || null, finishedAt: m.finished_at || null, competition: m.competition_name || null, map: m.voting?.map?.pick?.[0] || null, result: faceitResult(m, id) }));
    return providerResult('faceit', CORE_PROVIDER_NAMES.faceit, 'ok', {
      durationMs: Date.now() - started, profileUrl: player.faceit_url?.replace('{lang}', 'en') || `https://www.faceit.com/en/players/${id}`, data: {
        playerId: id, nickname: player.nickname || null, avatar: player.avatar || null, country: player.country || null,
        faceitUrl: player.faceit_url?.replace('{lang}', 'en') || null, verified: !!player.verified, region: game.region || null,
        level: game.skill_level ?? null, elo: game.faceit_elo ?? null,
        lifetime: { matches: pick(lifetime, 'Matches', 'matches'), wins: pick(lifetime, 'Wins', 'wins'), winRate: pick(lifetime, 'Win Rate %', 'Win Rate', 'win_rate'), kd: pick(lifetime, 'Average K/D Ratio', 'K/D Ratio', 'kd'), headshots: pick(lifetime, 'Average Headshots %', 'Headshots %', 'headshots') },
        recentMatches, bans: bans?.items || []
      }
    });
  } catch (e) { return providerResult('faceit', CORE_PROVIDER_NAMES.faceit, classifyError(e), { durationMs: Date.now() - started, error: `FACEIT: ${safeError(e)}` }); }
}

async function getLeetify(steamid, env) {
  const started = Date.now();
  try {
    const headers = { accept: 'application/json' };
    if (env.LEETIFY_API_KEY) headers.Authorization = `Bearer ${env.LEETIFY_API_KEY}`;
    const p = await fetchJson(apiUrl(`${LEETIFY_API}/v3/profile`, { steam64_id: steamid }), headers, 8000);
    if (!p || typeof p !== 'object') return providerResult('leetify', CORE_PROVIDER_NAMES.leetify, 'not_found', { durationMs: Date.now() - started });
    return providerResult('leetify', CORE_PROVIDER_NAMES.leetify, 'ok', {
      durationMs: Date.now() - started, profileUrl: `https://leetify.com/app/profile/${p.id || steamid}`, data: {
        id: p.id || null, steam64Id: p.steam64_id || steamid, name: p.name || null, privacyMode: p.privacy_mode || null,
        winrate: p.winrate ?? null, totalMatches: p.total_matches ?? null, firstMatchDate: p.first_match_date || null,
        ranks: p.ranks || {}, rating: p.rating || {}, stats: p.stats || {}, recentMatches: p.recent_matches || [], recentTeammates: p.recent_teammates || [], bans: p.bans || []
      }
    });
  } catch (e) { return providerResult('leetify', CORE_PROVIDER_NAMES.leetify, classifyError(e), { durationMs: Date.now() - started, error: `Leetify: ${safeError(e)}` }); }
}

async function getCommunityProviders(steamid, env) {
  const out = {};
  for (const [id, name, templateKey, tokenKey] of COMMUNITY_DEFS) {
    const template = env[templateKey];
    if (!template) {
      out[id] = providerResult(id, name, 'external_only', { profileUrl: toolUrl(id, steamid) });
      continue;
    }
    const started = Date.now();
    try {
      const target = template.replaceAll('{steamid}', encodeURIComponent(steamid));
      const headers = { accept: 'application/json' };
      if (env[tokenKey]) headers.Authorization = `Bearer ${env[tokenKey]}`;
      const data = await fetchJson(target, headers, 7000);
      out[id] = providerResult(id, name, 'ok', { durationMs: Date.now() - started, profileUrl: toolUrl(id, steamid), data });
    } catch (e) { out[id] = providerResult(id, name, classifyError(e), { durationMs: Date.now() - started, error: safeError(e), profileUrl: toolUrl(id, steamid) }); }
  }
  return out;
}

async function maybeStoreSnapshot(result, env) {
  try {
    const interval = positiveInt(env.SNAPSHOT_INTERVAL_SECONDS, DEFAULT_SNAPSHOT_INTERVAL);
    const newest = await env.DB.prepare('SELECT captured_at FROM player_snapshots WHERE steamid = ? ORDER BY captured_at DESC LIMIT 1').bind(result.steamid).first();
    const now = Math.floor(Date.now() / 1000);
    if (newest && now - newest.captured_at < interval) return;
    const s = result.steam.data || {};
    await env.DB.prepare(`INSERT INTO player_snapshots (steamid,captured_at,name,avatar,steam_json,faceit_json,leetify_json,community_json,consensus_json) VALUES (?,?,?,?,?,?,?,?,?)`).bind(
      result.steamid, now, s.name || null, s.avatarFull || s.avatar || null, JSON.stringify(result.steam), JSON.stringify(result.faceit), JSON.stringify(result.leetify), JSON.stringify(result.community || {}), JSON.stringify(result.consensus || {})
    ).run();
  } catch (_) { /* D1 is an enhancement; profile responses must remain available. */ }
}

async function loadLatestSnapshot(steamid, env) {
  try {
    const row = await env.DB.prepare('SELECT * FROM player_snapshots WHERE steamid = ? ORDER BY captured_at DESC LIMIT 1').bind(steamid).first();
    if (!row) return null;
    return snapshotFromRow(row);
  } catch (_) { return null; }
}

async function historyResponse(steamid, url, env) {
  if (!isSteamId64(steamid)) return jsonRaw({ error: 'Invalid SteamID64' }, 400);
  if (!env.DB) return jsonRaw({ error: 'D1 history is not configured' }, 501);
  const limit = Math.min(positiveInt(url.searchParams.get('limit'), 50), MAX_HISTORY);
  const rows = await env.DB.prepare(`SELECT * FROM player_snapshots WHERE steamid = ? ORDER BY captured_at DESC LIMIT ?`).bind(steamid, limit).all();
  return jsonRaw({ steamid, snapshots: (rows.results || []).map(snapshotFromRow) });
}

function snapshotFromRow(row) {
  return { capturedAt: new Date(row.captured_at * 1000).toISOString(), name: row.name, avatar: row.avatar, steam: parseJson(row.steam_json), faceit: parseJson(row.faceit_json), leetify: parseJson(row.leetify_json), community: parseJson(row.community_json || '{}'), consensus: parseJson(row.consensus_json || '{}') };
}

function toolsResponse(steamid) {
  if (!isSteamId64(steamid)) throw new InputError('Invalid SteamID64');
  return { steamid, tools: EXTERNAL_TOOLS.map(([id, name, description, makeUrl]) => ({ id, name, description, url: makeUrl(steamid), integrated: false })) };
}

function calculateConsensus({ steam, faceit, leetify, community }) {
  const signals = [];
  const s = steam?.data;
  const f = faceit?.data;
  const l = leetify?.data;
  if (steam?.status === 'ok' && s?.bans) {
    const banned = Number(s.bans.vacBans || 0) > 0 || Number(s.bans.gameBans || 0) > 0 || s.bans.communityBanned || s.bans.economyBan !== 'none';
    signals.push({ id: 'steam-bans', provider: 'Steam Web API', label: 'Steam ban state', value: banned ? 'bans_present' : 'no_bans_reported', weight: banned ? 5 : 1, factual: true });
  }
  if (s?.timeCreated) {
    const ageDays = Math.max(0, Math.floor((Date.now() - Number(s.timeCreated) * 1000) / 86400000));
    signals.push({ id: 'account-age', provider: 'Steam Web API', label: 'Account age', value: ageDays, weight: ageDays < 180 ? 2 : 0, factual: true });
  }
  if (s?.cs2PlaytimeMinutes != null) signals.push({ id: 'hours', provider: 'Steam Web API', label: 'CS2 hours', value: Math.round(Number(s.cs2PlaytimeMinutes) / 60), weight: 0, factual: true });
  if (f) {
    if (f.verified != null) signals.push({ id: 'faceit-verified', provider: 'FACEIT Data API', label: 'FACEIT verified', value: !!f.verified, weight: f.verified ? -1 : 0, factual: true });
    if (f.level != null) signals.push({ id: 'faceit-level', provider: 'FACEIT Data API', label: 'FACEIT level', value: f.level, weight: 0, factual: true });
    if (f.bans?.length) signals.push({ id: 'faceit-bans', provider: 'FACEIT Data API', label: 'FACEIT bans', value: f.bans.length, weight: 4, factual: true });
  }
  if (l?.bans?.length) signals.push({ id: 'leetify-bans', provider: 'Leetify Public API', label: 'Leetify platform bans', value: l.bans.length, weight: 4, factual: true });
  for (const p of Object.values(community || {})) if (p.status === 'ok' && p.data && findRisk(p.data) != null) signals.push({ id: `${p.id}-risk`, provider: p.name, label: 'Provider risk/reputation signal', value: findRisk(p.data), weight: 0, factual: false });
  if (!signals.length) return { status: 'insufficient_data', score: null, band: null, signals: [], explanation: 'No independent provider signals were available.' };
  const score = Math.max(0, Math.min(100, signals.reduce((sum, signal) => sum + signal.weight * 10, 0)));
  const band = score >= 50 ? 'elevated_signals' : score >= 20 ? 'mixed_signals' : 'low_signals';
  return { status: 'ok', score, band, signals, explanation: 'Monster Consensus is a deterministic summary of attributed provider signals, not a cheat finding or Valve Trust Factor.' };
}

function findRisk(value, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 2) return null;
  for (const [key, candidate] of Object.entries(value)) {
    if (/risk|reputation|trust/i.test(key) && (typeof candidate === 'number' || typeof candidate === 'string')) return candidate;
    if (candidate && typeof candidate === 'object') { const found = findRisk(candidate, depth + 1); if (found != null) return found; }
  }
  return null;
}

function providerResult(id, name, status, extra = {}) { return { id, name, status, fetchedAt: status === 'ok' ? new Date().toISOString() : null, profileUrl: extra.profileUrl || null, metrics: extra.metrics || {}, data: extra.data ?? null, raw: extra.raw ?? null, durationMs: extra.durationMs ?? null, error: extra.error || null }; }
function classifyError(error) { return String(error?.message || '').includes('returned 404') ? 'not_found' : String(error?.message || '').includes('429') ? 'rate_limited' : 'error'; }
function steamProfile(id) { return `https://steamcommunity.com/profiles/${id}`; }
function toolUrl(id, steamid) { return EXTERNAL_TOOLS.find(x => x[0] === id)?.[3](steamid) || null; }
function faceitHeaders(env) { return { Authorization: `Bearer ${env.FACEIT_API_KEY}`, accept: 'application/json' }; }
function faceitResult(match, playerId) { const winner = match.results?.winner; if (!winner || !match.teams) return null; for (const [side, team] of Object.entries(match.teams)) if ((team.players || []).some(p => p.player_id === playerId)) return side === winner ? 'W' : 'L'; return null; }
function pick(obj, ...keys) { for (const key of keys) if (obj?.[key] !== undefined) return obj[key]; return null; }
function decodeSegment(value) { try { return decodeURIComponent(value); } catch { throw new InputError('Invalid URL encoding'); } }
function isSteamId64(value) { return /^7656119\d{10}$/.test(String(value || '')); }
function positiveInt(value, fallback) { const n = Number(value); return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback; }
function apiUrl(base, params) { const u = new URL(base); for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null) u.searchParams.set(key, String(value)); return u.toString(); }
function parseJson(value) { try { return JSON.parse(value); } catch { return null; } }
function safeError(error) { return error instanceof Error ? error.message.slice(0, 300) : String(error).slice(0, 300); }

async function fetchJson(url, headers = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`${new URL(url).hostname} returned ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('json')) throw new Error(`${new URL(url).hostname} returned non-JSON data`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

function cors(response, request, env) {
  const origin = request.headers.get('Origin');
  const configured = env.ALLOWED_ORIGIN || 'https://steamcommunity.monster';
  const isPreview = origin && /^https:\/\/(?:[a-z0-9-]+\.)?steamcommunity-monster\.pages\.dev$/.test(origin);
  const isLocal = origin && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
  const allowed = origin && (origin === configured || isPreview || isLocal) ? origin : configured;
  response.headers.set('Access-Control-Allow-Origin', allowed);
  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Accept');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}
function json(body, status, request, env) { return cors(jsonRaw(body, status), request, env); }
function jsonRaw(body, status = 200, extra = {}) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra } }); }

export { COMMUNITY_DEFS, EXTERNAL_TOOLS, calculateConsensus, isSteamId64, parseInput, providerResult, toolsResponse };
