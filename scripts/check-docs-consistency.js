'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const required = [
  'README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'PLANS.md',
  'docs/README.md', 'docs/PB.md', 'docs/SDD.md', 'docs/CCR.md',
  'docs/openapi/oa-proxy.openapi.yaml',
];
const issues = [];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) issues.push(`Missing public document: ${relative}`);
}

const expectations = [
  ['README.md', 'docs/openapi/oa-proxy.openapi.yaml'],
  ['docs/PB.md', 'Public/private boundary'],
  ['docs/SDD.md', 'External proxy boundary'],
  ['docs/CCR.md', 'OAProxyService'],
  ['PLANS.md', 'T20'],
];
for (const [relative, text] of expectations) {
  const content = fs.existsSync(path.join(root, relative))
    ? fs.readFileSync(path.join(root, relative), 'utf8') : '';
  if (!content.includes(text)) issues.push(`${relative} is missing required public text: ${text}`);
}

if (issues.length) {
  console.error('Documentation consistency check failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('PASS: public documentation is complete and internally consistent.');
