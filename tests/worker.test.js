import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateConsensus, isSteamId64, parseInput, providerResult, toolsResponse } from '../worker/src/index.js';

const steamid = '76561198000000000';

test('accepts SteamID64 and both supported profile URL hosts', () => {
  assert.deepEqual(parseInput(steamid), { steamid, kind: 'steamid64' });
  assert.deepEqual(parseInput(`https://steamcommunity.com/profiles/${steamid}`), { steamid, kind: 'profile-url' });
  assert.deepEqual(parseInput(`https://steamcommunity.monster/profiles/${steamid}`), { steamid, kind: 'profile-url' });
  assert.deepEqual(parseInput('https://steamcommunity.com/id/player_name'), { vanity: 'player_name', kind: 'vanity-url' });
  assert.deepEqual(parseInput('player_name'), { vanity: 'player_name', kind: 'vanity' });
});

test('rejects unrelated hosts and malformed identifiers', () => {
  assert.throws(() => parseInput('https://example.com/id/player'), /Only Steam/);
  assert.throws(() => parseInput(`https://steamcommunity.com/profiles/${steamid}x`), /valid Steam profile path/);
  assert.throws(() => parseInput('7656119800000000'), /Unsupported/);
});

test('generates canonical external tool URLs', () => {
  const response = toolsResponse(steamid);
  assert.equal(response.steamid, steamid);
  assert.ok(response.tools.length >= 10);
  assert.equal(response.tools.find(tool => tool.id === 'csstats').url, `https://csstats.gg/player/${steamid}`);
  assert.ok(response.tools.every(tool => tool.url.startsWith('https://')));
});

test('normalizes provider results with explicit status', () => {
  const result = providerResult('demo', 'Demo', 'external_only', { profileUrl: 'https://example.test/player' });
  assert.deepEqual(result, {
    id: 'demo', name: 'Demo', status: 'external_only', fetchedAt: null,
    profileUrl: 'https://example.test/player', metrics: {}, data: null, raw: null,
    durationMs: null, error: null
  });
});

test('returns insufficient data rather than inventing a consensus', () => {
  assert.deepEqual(calculateConsensus({ steam: {}, faceit: {}, leetify: {}, community: {} }), {
    status: 'insufficient_data', score: null, band: null, signals: [],
    explanation: 'No independent provider signals were available.'
  });
});

test('consensus attributes factual ban signals and is bounded', () => {
  const result = calculateConsensus({
    steam: { status: 'ok', data: { bans: { vacBans: 2 }, timeCreated: Math.floor(Date.now() / 1000) - 10 * 86400, cs2PlaytimeMinutes: 100 } },
    faceit: { status: 'ok', data: { verified: true, level: 10, bans: [] } },
    leetify: { status: 'ok', data: { bans: [] } }, community: {}
  });
  assert.equal(result.status, 'ok');
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.equal(result.signals.find(signal => signal.id === 'steam-bans').factual, true);
  assert.match(result.explanation, /not a cheat finding/);
});

test('player API keeps independent provider failures visible', async () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = globalThis.caches;
  globalThis.fetch = async () => new Response(JSON.stringify({}), { status: 200, headers: { 'content-type': 'application/json' } });
  globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };
  try {
    const response = await (await import('../worker/src/index.js')).default.fetch(
      new Request(`https://api.test/v1/player/${steamid}`),
      {},
      { waitUntil: promise => promise }
    );
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.steam.status, 'not_configured');
    assert.equal(body.faceit.status, 'not_configured');
    assert.equal(body.leetify.status, 'ok');
    assert.equal(body.consensus.status, 'insufficient_data');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.caches = originalCaches;
  }
});
