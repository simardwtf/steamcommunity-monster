import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const worker = resolve(root, 'worker');

const project = 'steamcommunity-monster';
const database = 'steamcommunity-monster';
function parseJsonc(text) {
  let output = '', quote = false, escaped = false, lineComment = false, blockComment = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index], next = text[index + 1];
    if (lineComment) { if (char === '\n') { lineComment = false; output += char; } continue; }
    if (blockComment) { if (char === '*' && next === '/') { blockComment = false; index += 1; } continue; }
    if (quote) {
      output += char;
      if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === '"') quote = false;
      continue;
    }
    if (char === '"') { quote = true; output += char; continue; }
    if (char === '/' && next === '/') { lineComment = true; index += 1; continue; }
    if (char === '/' && next === '*') { blockComment = true; index += 1; continue; }
    output += char;
  }
  return JSON.parse(output.replace(/,\s*([}\]])/g, '$1'));
}
function run(args, options = {}) {
  console.log(`> wrangler ${args.join(' ')}`);
  return execFileSync('npx', ['--yes', 'wrangler', ...args], { cwd: options.cwd || root, encoding: 'utf8', stdio: options.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit' });
}
function jsonCommand(args, cwd) { try { return JSON.parse(run([...args, '--json'], { cwd, capture: true })); } catch { return null; } }
function ensureDatabase() {
  const list = jsonCommand(['d1', 'list'], worker) || [];
  let record = (Array.isArray(list) ? list : list.result || []).find(item => item.name === database);
  if (!record) {
    const created = jsonCommand(['d1', 'create', database], worker);
    record = created?.result || created;
  }
  const id = record?.uuid || record?.database_id || record?.id;
  if (!id) throw new Error('D1 database ID was not returned. Check Wrangler permissions and create it manually.');
  const configPath = resolve(worker, 'wrangler.jsonc');
  const config = parseJsonc(readFileSync(configPath, 'utf8'));
  config.d1_databases = [{ binding: 'DB', database_name: database, database_id: id, migrations_dir: 'migrations' }];
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`D1 binding configured for ${database}.`);
}
try {
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) console.warn('CLOUDFLARE_API_TOKEN/ACCOUNT_ID not set; Wrangler login may still be available.');
  run(['whoami']);
  ensureDatabase();
  const pages = jsonCommand(['pages', 'project', 'list'], root) || [];
  const projects = Array.isArray(pages) ? pages : pages.result || [];
  if (!projects.some(item => item.name === project)) run(['pages', 'project', 'create', project, '--production-branch', 'main']);
  run(['d1', 'migrations', 'apply', database, '--remote'], worker);
  run(['deploy', '--config', 'wrangler.jsonc'], worker);
  run(['pages', 'deploy', 'pages', '--project-name', project], root);
  try { run(['pages', 'domain', 'add', 'steamcommunity.monster', '--project-name', project]); } catch { console.warn('Pages domain attachment was not completed; attach steamcommunity.monster in Cloudflare Pages.'); }
  console.log('Cloudflare bootstrap complete. DNS zone ownership and custom-domain certificates remain Cloudflare-managed.');
} catch (error) {
  console.error(`Bootstrap stopped: ${error.message}`);
  console.error('Check Wrangler authentication, account ID, API token scopes, and DNS zone ownership. No existing resources were deleted.');
  process.exitCode = 1;
}
