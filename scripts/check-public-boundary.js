'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const requiredPaths = [
  'cloudapp/src/app', 'cloudapp/src/assets/manifest.json', 'manifest.json',
  'docs/openapi/oa-proxy.openapi.yaml', '.github/workflows/ci.yml',
];
const prohibitedPaths = [
  'cloudapp/src/server', 'deploy', 'Containerfile.oa-proxy', '.dockerignore',
  '.github/workflows/deploy-oa-proxy-podman.yml', 'SECURITY_NOTES.md',
];
const issues = [];
const exists = relative => fs.existsSync(path.join(root, relative));
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

for (const relative of requiredPaths) if (!exists(relative)) issues.push(`Missing required public path: ${relative}`);
for (const relative of prohibitedPaths) if (exists(relative)) issues.push(`Prohibited private/operational path: ${relative}`);

const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));
const lockRoot = packageLock.packages?.[''];
assert.equal(packageJson.name, '@iastate/lib-oa-compass-admin');
assert.equal(packageJson.version, '2.0.3');
assert.equal(packageJson.license, 'Apache-2.0');
assert.equal(packageJson.private, true);
assert.equal(lockRoot?.name, packageJson.name);
assert.equal(lockRoot?.version, packageJson.version);
assert.equal(lockRoot?.license, packageJson.license);
for (const script of Object.keys(packageJson.scripts || {})) {
  if (/proxy|deploy|container/i.test(script)) issues.push(`Prohibited package script: ${script}`);
}

const workflow = read('.github/workflows/ci.yml');
for (const pattern of [/workflow_dispatch/, /self-hosted/, /packages:\s*write/, /secrets\./]) {
  if (pattern.test(workflow)) issues.push(`Public CI contains prohibited capability: ${pattern}`);
}

const contract = read('docs/openapi/oa-proxy.openapi.yaml');
if (contract.includes('app.lib.iastate.edu')) issues.push('Public OpenAPI contains the production proxy hostname.');
if (!/^\s*version:\s*1\.0\.0\s*$/m.test(contract)) issues.push('OpenAPI contract version must remain 1.0.0.');

const allowedProductionHostFiles = new Set([
  'manifest.json',
  'cloudapp/src/assets/manifest.json',
  'cloudapp/src/app/services/oa-proxy.service.ts',
  'scripts/check-manifests.js',
  'scripts/check-public-boundary.js',
]);
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'build', '.ng'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else {
      const relative = path.relative(root, absolute).replaceAll('\\', '/');
      if (!/\.(?:js|json|md|ts|yaml|yml)$/.test(relative)) continue;
      const content = fs.readFileSync(absolute, 'utf8');
      if (content.includes('app.lib.iastate.edu') && !allowedProductionHostFiles.has(relative)) {
        issues.push(`Production proxy hostname is not allowed in ${relative}`);
      }
      if (relative !== 'scripts/check-public-boundary.js') {
        for (const pattern of [/GHCR_TOKEN/, /GHCR_USERNAME/, /read:packages/, /write:packages/, /delete:packages/, /self-hosted/, /\/opt\/oa-compass/, /sudoers/i, /\bpodman\b/i]) {
          if (pattern.test(content)) issues.push(`Operational content ${pattern} found in ${relative}`);
        }
      }
    }
  }
}
walk(root);

if (issues.length) {
  console.error('Public repository boundary check failed:');
  for (const issue of [...new Set(issues)]) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('PASS: repository contains only the approved public frontend and API-contract boundary.');
