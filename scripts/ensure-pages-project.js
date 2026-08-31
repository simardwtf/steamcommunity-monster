import { execFileSync } from 'node:child_process';

const project = 'steamcommunity-monster';
const domain = 'steamcommunity.monster';
function run(args, capture = false) {
  return execFileSync('npx', ['--yes', 'wrangler', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit'
  });
}
function parseResult(output) {
  const parsed = JSON.parse(output);
  return Array.isArray(parsed) ? parsed : parsed.result || [];
}
function listProjects() {
  try { return parseResult(run(['pages', 'project', 'list', '--json'], true)); }
  catch (error) { throw new Error(`Could not list Cloudflare Pages projects: ${error.message}`); }
}
async function ensureDomain() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required to attach the Pages domain.');
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(project)}/domains`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const listing = await fetch(endpoint, { headers });
  const listingBody = await listing.json().catch(() => ({}));
  if (!listing.ok || listingBody.success === false) throw new Error(`Could not list Pages domains (${listing.status}).`);
  const domains = listingBody.result || [];
  if (domains.some(item => item.name === domain || item.domain === domain)) {
    console.log(`Pages domain ${domain} already exists.`);
    return;
  }
  const created = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ name: domain }) });
  const createdBody = await created.json().catch(() => ({}));
  if (!created.ok || createdBody.success === false) throw new Error(`Could not attach Pages domain ${domain} (${created.status}).`);
  console.log(`Attached Pages domain ${domain}.`);
}
async function main() {
  const projects = listProjects();
  if (projects.some(item => item.name === project)) console.log(`Pages project ${project} already exists.`);
  else {
    try {
      run(['pages', 'project', 'create', project, '--production-branch', 'main']);
      console.log(`Created Pages project ${project}.`);
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
      console.log(`Pages project ${project} already exists.`);
    }
  }
  await ensureDomain();
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
