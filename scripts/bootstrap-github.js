import { execFileSync } from 'node:child_process';

for (const name of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN']) {
  const value = process.env[name];
  if (!value) { console.log(`${name} is not present in the environment; skipped.`); continue; }
  try {
    execFileSync('gh', ['secret', 'set', name], { input: `${value}\n`, stdio: ['pipe', 'inherit', 'inherit'] });
    console.log(`${name} configured without printing its value.`);
  } catch (error) {
    console.error(`Could not set ${name}. Ensure gh is authenticated and a repository is selected.`);
    process.exitCode = 1;
  }
}
