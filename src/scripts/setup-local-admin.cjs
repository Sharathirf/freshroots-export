const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const filePath = path.join(process.cwd(), '.env.local');
const existingFile = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
const additions = [];

function configured(name) {
  return Boolean(process.env[name]) || new RegExp(`^${name}\\s*=`, 'm').test(existingFile);
}

if (!configured('ADMIN_PASSWORD')) additions.push(`ADMIN_PASSWORD="${randomBytes(24).toString('base64url')}"`);
if (!configured('ADMIN_SESSION_SECRET')) additions.push(`ADMIN_SESSION_SECRET="${randomBytes(48).toString('base64url')}"`);
if (!configured('CRON_SECRET')) additions.push(`CRON_SECRET="${randomBytes(32).toString('base64url')}"`);

if (additions.length) {
  fs.appendFileSync(filePath, `${existingFile && !existingFile.endsWith('\n') ? '\n' : ''}\n# Local-only generated secrets\n${additions.join('\n')}\n`, { mode: 0o600 });
  fs.chmodSync(filePath, 0o600);
}

console.log(additions.length ? 'Generated local admin and scheduler secrets in ignored .env.local.' : 'Local admin and scheduler secrets are already configured.');
console.log('Open .env.local locally to view the generated administrator password. Do not copy these values to source control.');
