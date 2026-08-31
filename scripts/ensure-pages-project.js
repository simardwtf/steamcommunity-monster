const project = 'steamcommunity-monster';
const domain = 'steamcommunity.monster';

function endpoint(accountId, suffix = '') {
  return `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/pages/projects${suffix}`;
}
function headers(token) { return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }; }
async function requestJson(url, init) {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    const detail = body.errors?.map(error => error.message).join('; ') || `HTTP ${response.status}`;
    throw new Error(detail);
  }
  return body;
}
async function ensureProject(accountId, token) {
  const listing = await requestJson(endpoint(accountId), { headers: headers(token) });
  const projects = listing.result || [];
  if (projects.some(item => item.name === project)) {
    console.log(`Pages project ${project} already exists.`);
    return;
  }
  try {
    await requestJson(endpoint(accountId), {
      method: 'POST', headers: headers(token),
      body: JSON.stringify({ name: project, production_branch: 'main' })
    });
    console.log(`Created Pages project ${project}.`);
  } catch (error) {
    if (!error.message.toLowerCase().includes('already exists')) throw error;
    console.log(`Pages project ${project} already exists.`);
  }
}
async function ensureDomain(accountId, token) {
  const url = endpoint(accountId, `/${encodeURIComponent(project)}/domains`);
  const authHeaders = headers(token);
  const listing = await requestJson(url, { headers: authHeaders });
  const domains = listing.result || [];
  if (domains.some(item => item.name === domain || item.domain === domain)) {
    console.log(`Pages domain ${domain} already exists.`);
    return;
  }
  await requestJson(url, { method: 'POST', headers: authHeaders, body: JSON.stringify({ name: domain }) });
  console.log(`Attached Pages domain ${domain}.`);
}
async function ensureDns(accountId, token) {
  const authHeaders = headers(token);
  const zonesUrl = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(domain)}&status=active`;
  const zones = await requestJson(zonesUrl, { headers: authHeaders });
  const zone = zones.result?.[0];
  if (!zone) throw new Error(`Cloudflare zone ${domain} is not active in account ${accountId}; delegate the domain to Cloudflare before deployment.`);
  const recordsUrl = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(zone.id)}/dns_records?name=${encodeURIComponent(domain)}`;
  const records = await requestJson(recordsUrl, { headers: authHeaders });
  const existing = records.result || [];
  const target = `${project}.pages.dev`;
  if (existing.length) {
    const pagesRecord = existing.find(record => record.type === 'CNAME' && record.content === target);
    if (pagesRecord) { console.log(`DNS record ${domain} already points to ${target}.`); return; }
    throw new Error(`DNS record ${domain} already exists with a different target; refusing to replace unrelated DNS.`);
  }
  await requestJson(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(zone.id)}/dns_records`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ type: 'CNAME', name: domain, content: target, ttl: 1, proxied: true })
  });
  console.log(`Created proxied DNS CNAME ${domain} -> ${target}.`);
}
async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required.');
  await ensureProject(accountId, token);
  await ensureDomain(accountId, token);
  await ensureDns(accountId, token);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
