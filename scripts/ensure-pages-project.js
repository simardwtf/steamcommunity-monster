import { execFileSync } from 'node:child_process';

const project = 'steamcommunity-monster';
function run(args, capture = false) {
  return execFileSync('npx', ['--yes', 'wrangler', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit'
  });
}
function listProjects() {
  try {
    const output = run(['pages', 'project', 'list', '--json'], true);
    const parsed = JSON.parse(output);
    return Array.isArray(parsed) ? parsed : parsed.result || [];
  } catch (error) {
    throw new Error(`Could not list Cloudflare Pages projects: ${error.message}`);
  }
}
try {
  const projects = listProjects();
  if (projects.some(item => item.name === project)) {
    console.log(`Pages project ${project} already exists.`);
  } else {
    run(['pages', 'project', 'create', project, '--production-branch', 'main']);
    console.log(`Created Pages project ${project}.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
