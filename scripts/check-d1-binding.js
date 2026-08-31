import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseJsonc(text) {
  let output = '';
  let quoted = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (lineComment) {
      if (char === '\n') { lineComment = false; output += char; }
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; index += 1; }
      continue;
    }
    if (quoted) {
      output += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') { quoted = true; output += char; continue; }
    if (char === '/' && next === '/') { lineComment = true; index += 1; continue; }
    if (char === '/' && next === '*') { blockComment = true; index += 1; continue; }
    output += char;
  }
  return JSON.parse(output.replace(/,\s*([}\]])/g, '$1'));
}

const config = parseJsonc(readFileSync(resolve('worker', 'wrangler.jsonc'), 'utf8'));
const bindings = config.d1_databases || [];
const configured = Array.isArray(bindings) && bindings.some(binding => binding.binding === 'DB' && binding.database_name && binding.database_id && binding.database_id !== 'REPLACE_WITH_D1_DATABASE_ID');
console.log(configured ? 'D1 binding configured; migrations enabled.' : 'D1 binding not configured; migrations skipped.');
process.exitCode = configured ? 0 : 1;
