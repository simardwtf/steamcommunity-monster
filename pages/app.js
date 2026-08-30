const API_BASE = (window.MONSTER_CONFIG?.apiBase || 'https://api.steamcommunity.monster').replace(/\/$/, '');
const $ = selector => document.querySelector(selector);
const form = $('#searchForm');
const input = $('#searchInput');
const state = $('#state');
const profile = $('#profile');
const hero = $('#hero');
let lastQuery = '';
let lookupSequence = 0;

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const fmt = (value, fallback = '—') => value === null || value === undefined || value === '' || Number.isNaN(Number(value)) ? fallback : new Intl.NumberFormat().format(value);
const pct = value => value === null || value === undefined ? '—' : `${(Number(value) <= 1 ? Number(value) * 100 : Number(value)).toFixed(1)}%`;
const hours = minutes => minutes == null ? '—' : `${Math.round(Number(minutes) / 60).toLocaleString()} h`;
const date = value => { if (!value) return '—'; const parsed = new Date(typeof value === 'number' && value < 2e12 ? value * 1000 : value); return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString(); };
const safeDecode = value => { try { return decodeURIComponent(value); } catch { return ''; } };
const safeUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : '#'; } catch { return '#'; } };
const time = value => { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

function showState(message, cls = '') { state.className = `state ${cls}`.trim(); state.innerHTML = message; profile.classList.add('hidden'); }
function clearState() { state.className = 'state hidden'; state.textContent = ''; }
function statusLabel(provider) {
  const status = provider?.status || (provider?.ok ? 'ok' : 'error');
  const label = { ok: 'LIVE', public: 'PUBLIC', not_configured: 'NOT CONFIGURED', external_only: 'EXTERNAL ONLY', not_found: 'NOT FOUND', rate_limited: 'RATE LIMITED', error: 'UNAVAILABLE' }[status] || status.toUpperCase();
  return `<span class="status ${status === 'ok' || status === 'public' ? 'ok' : status === 'external_only' ? 'external' : 'miss'}">${escapeHtml(label)}</span>`;
}
function kv(label, value) { return `<div class="kv"><span>${escapeHtml(label)}</span><span>${escapeHtml(value ?? '—')}</span></div>`; }
function scalarFields(object, max = 12) {
  if (!object || typeof object !== 'object') return '';
  const rows = [];
  const walk = (value, prefix = '', depth = 0) => {
    if (rows.length >= max || depth > 2 || value == null) return;
    for (const [key, item] of Object.entries(value)) {
      if (rows.length >= max) break;
      const path = prefix ? `${prefix}.${key}` : key;
      if (['string', 'number', 'boolean'].includes(typeof item)) rows.push([path, String(item)]);
      else if (item && typeof item === 'object' && !Array.isArray(item)) walk(item, path, depth + 1);
    }
  };
  walk(object);
  return rows.map(row => kv(...row)).join('');
}
function providerNote(provider) { return provider?.error ? escapeHtml(provider.error) : provider?.status === 'external_only' ? 'External link only; no authorized API configured.' : 'No data returned.'; }
function toolLinks(data) {
  return (data.tools || []).map(tool => [tool.name, tool.description, tool.url, tool.integrated]);
}
function consensusCard(consensus) {
  if (!consensus || consensus.status === 'insufficient_data') return `<div class="consensus insufficient"><b>INSUFFICIENT DATA</b><span>${escapeHtml(consensus?.explanation || 'Independent signals are not available.')}</span></div>`;
  const signals = (consensus.signals || []).map(signal => kv(signal.label, `${signal.value} · ${signal.provider}`)).join('');
  return `<div class="consensus"><div class="consensus-score"><span>MONSTER CONSENSUS</span><strong>${fmt(consensus.score)}/100</strong><em>${escapeHtml(consensus.band || '')}</em></div><div class="consensus-copy">${escapeHtml(consensus.explanation || '')}</div><div class="signals">${signals}</div></div>`;
}

function render(data) {
  clearState(); hero.classList.add('hidden');
  const steam = data.steam?.data || {};
  const faceit = data.faceit?.data || {};
  const leetify = data.leetify?.data || {};
  const bans = steam.bans || {};
  const lifetime = faceit.lifetime || {};
  const stats = leetify.stats || {};
  const ranks = leetify.ranks || {};
  const rating = leetify.rating || {};
  const cards = [
    ['CS2 PLAYTIME', hours(steam.cs2PlaytimeMinutes), 'Steam'],
    ['FACEIT ELO', fmt(faceit.elo), faceit.level ? `Level ${faceit.level}` : 'FACEIT'],
    ['PREMIER', fmt(ranks.premier ?? leetify.premier), 'Leetify'],
    ['VAC / GAME BANS', `${fmt(bans.vacBans, '0')} / ${fmt(bans.gameBans, '0')}`, bans.communityBanned ? 'Community banned' : 'Steam']
  ].map(card => `<div class="card"><div class="label">${escapeHtml(card[0])}</div><div class="value">${escapeHtml(card[1])}</div><div class="sub">${escapeHtml(card[2])}</div></div>`).join('');
  const steamFields = [['Steam level', steam.steamLevel], ['Account created', date(steam.timeCreated)], ['Profile visibility', steam.visibility], ['VAC bans', bans.vacBans ?? 0], ['Game bans', bans.gameBans ?? 0], ['Days since last ban', bans.daysSinceLastBan], ['Community banned', bans.communityBanned ? 'Yes' : 'No'], ['Economy ban', bans.economyBan]].map(item => kv(...item)).join('');
  const faceitFields = [['Nickname', faceit.nickname], ['Level', faceit.level], ['ELO', faceit.elo], ['Region', faceit.region], ['Country', faceit.country], ['Verified', faceit.verified ? 'Yes' : 'No'], ['Matches', lifetime.matches], ['Wins', lifetime.wins], ['Win rate', lifetime.winRate], ['K/D', lifetime.kd], ['Headshots', lifetime.headshots], ['FACEIT bans', faceit.bans?.length ?? 0]].map(item => kv(...item)).join('');
  const leetifyFields = [['Name', leetify.name], ['Total matches', leetify.totalMatches], ['Win rate', pct(leetify.winrate)], ['Premier', ranks.premier], ['Aim rating', rating.aim], ['Positioning', rating.positioning], ['Utility', rating.utility], ['K/D', stats.kdRatio ?? stats.kd], ['ADR', stats.adr], ['Preaim', stats.preaim], ['Platform bans', leetify.bans?.length ?? 0]].map(item => kv(...item)).join('');
  const faceitMatches = (faceit.recentMatches || []).slice(0, 5).map(match => `<div class="match"><span class="map">${escapeHtml(match.map || match.competition || 'FACEIT')}</span><span class="date">${escapeHtml(date(match.finishedAt))}</span><span class="${match.result === 'W' ? 'result-win' : match.result === 'L' ? 'result-loss' : ''}">${escapeHtml(match.result || '—')}</span></div>`).join('') || '<div class="source-note">No public recent FACEIT matches.</div>';
  const leetifyMatches = (leetify.recentMatches || []).slice(0, 5).map(match => `<div class="match"><span class="map">${escapeHtml(match.map || match.mapName || match.dataSource || 'Match')}</span><span class="date">${escapeHtml(date(match.finishedAt || match.finished_at))}</span><span>${escapeHtml(match.score || match.result || '')}</span></div>`).join('') || '<div class="source-note">No public recent Leetify matches.</div>';
  const community = Object.entries(data.community || {}).map(([key, provider]) => `<div class="provider"><div class="provider-head"><span class="provider-name">${escapeHtml(provider.name || key)}</span>${statusLabel(provider)}</div>${provider.status === 'ok' ? scalarFields(provider.data) : `<div class="source-note">${providerNote(provider)}</div>`}${provider.durationMs != null ? `<div class="source-note">Fetched in ${fmt(provider.durationMs)} ms.</div>` : ''}</div>`).join('');
  const tools = toolLinks(data).map(([name, description, url, integrated]) => `<a class="tool" target="_blank" rel="noopener noreferrer" href="${escapeHtml(safeUrl(url))}"><b>${escapeHtml(name)} ↗</b><span>${escapeHtml(description)}${integrated ? ' · integrated' : ' · external'}</span></a>`).join('');
  const monsterUrl = `${location.origin}/profiles/${data.steamid}`;
  profile.innerHTML = `
    <div class="profile-head"><img class="avatar" src="${escapeHtml(safeUrl(steam.avatarFull || steam.avatar || ''))}" alt="" /><div class="identity"><h2>${escapeHtml(steam.name || leetify.name || faceit.nickname || data.steamid)}</h2><div class="meta">STEAMID64 ${escapeHtml(data.steamid)}<br>${escapeHtml(steam.realName || '')} ${steam.country ? `· ${escapeHtml(steam.country)}` : ''}</div></div><div class="head-actions"><button class="btn primary" id="copyMonster">COPY .MONSTER URL</button><button class="btn" id="refreshProfile">REFRESH</button><a class="btn" target="_blank" rel="noopener noreferrer" href="${escapeHtml(safeUrl(steam.profileUrl || `https://steamcommunity.com/profiles/${data.steamid}`))}">STEAM ↗</a></div></div>
    <div class="section-title"><h3>Snapshot</h3><span>Fetched ${escapeHtml(time(data.fetchedAt))}${data.cached ? ' · edge cached' : ''}${data.fallback ? ' · stale D1 fallback available' : ''}</span></div>
    <div class="cards">${cards}</div>
    <div class="section-title"><h3>Monster Consensus</h3><span>Independent attributed signals; not Valve Trust Factor</span></div>${consensusCard(data.consensus)}
    <div class="section-title"><h3>Core sources</h3><span>Provider freshness is shown per card</span></div><div class="provider-layout"><div class="provider"><div class="provider-head"><span class="provider-name">Steam</span>${statusLabel(data.steam)}</div>${steamFields}</div><div class="provider"><div class="provider-head"><span class="provider-name">FACEIT</span>${statusLabel(data.faceit)}</div>${faceitFields}</div><div class="provider"><div class="provider-head"><span class="provider-name">Leetify</span>${statusLabel(data.leetify)}</div>${leetifyFields}</div><div class="provider"><div class="provider-head"><span class="provider-name">Recent FACEIT</span></div><div class="matches">${faceitMatches}</div></div><div class="provider"><div class="provider-head"><span class="provider-name">Recent Leetify</span></div><div class="matches">${leetifyMatches}</div></div></div>
    ${community ? `<div class="section-title"><h3>Community / partner results</h3><span>Only configured APIs are queried</span></div><div class="provider-layout">${community}</div>` : ''}
    ${data.fallback ? `<div class="state warning">Critical provider unavailable. Showing current partial results; a stale snapshot from ${escapeHtml(date(data.fallback.capturedAt))} is available.</div>` : ''}
    <div class="section-title"><h3>Community tools</h3><span>Canonical SteamID64 links</span></div><div class="tools">${tools}</div>`;
  profile.classList.remove('hidden');
  profile.setAttribute('tabindex', '-1');
  profile.focus();
  $('#copyMonster')?.addEventListener('click', async event => { try { await navigator.clipboard.writeText(monsterUrl); event.currentTarget.textContent = 'COPIED'; setTimeout(() => { event.currentTarget.textContent = 'COPY .MONSTER URL'; }, 1200); } catch { event.currentTarget.textContent = 'COPY FAILED'; } });
  $('#refreshProfile')?.addEventListener('click', () => lookup(lastQuery, false, true));
}

async function lookup(raw, push = false, refresh = false) {
  const query = (raw || '').trim(); if (!query) return;
  const sequence = ++lookupSequence;
  lastQuery = query;
  showState('<span class="spinner"></span><div><b>Tracking player…</b><br><span class="loading-copy">Steam → FACEIT → Leetify → independent provider signals</span></div>', 'loading');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const endpoint = `${API_BASE}/v1/player?input=${encodeURIComponent(query)}${refresh ? '&refresh=1' : ''}`;
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, signal: controller.signal });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Lookup failed (${response.status})`);
    if (sequence !== lookupSequence) return;
    if (push) history.pushState({}, '', `/profiles/${encodeURIComponent(body.steamid)}`);
    render(body);
  } catch (error) {
    if (sequence !== lookupSequence) return;
    hero.classList.remove('hidden');
    showState(`<div class="error"><b>Lookup failed.</b> ${escapeHtml(error.name === 'AbortError' ? 'The API request timed out. Try again.' : error.message)}</div>`, 'error');
  } finally {
    clearTimeout(timeout);
  }
}
function initialInput() {
  const path = safeDecode(location.pathname);
  const match = path.match(/^\/(id|profiles)\/([^/]+)\/?$/i);
  if (match) {
    const segment = safeDecode(match[2]);
    if (match[1].toLowerCase() === 'profiles' && /^7656119\d{10}$/.test(segment)) return segment;
    if (match[1].toLowerCase() === 'id' && /^[A-Za-z0-9_-]{2,64}$/.test(segment)) return `https://steamcommunity.com/id/${segment}`;
  }
  return new URLSearchParams(location.search).get('q') || '';
}
form.addEventListener('submit', event => { event.preventDefault(); lookup(input.value, true); });
window.addEventListener('popstate', () => { const query = initialInput(); if (query) { input.value = query; lookup(query); } else { profile.classList.add('hidden'); clearState(); hero.classList.remove('hidden'); } });
const initial = initialInput(); if (initial) { input.value = initial; lookup(initial); }
