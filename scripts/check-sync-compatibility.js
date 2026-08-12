'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const workflow = fs.readFileSync(
  path.join(root, 'cloudapp/src/app/services/oa-workflow.service.ts'),
  'utf8'
);
const translations = JSON.parse(fs.readFileSync(
  path.join(root, 'cloudapp/src/i18n/en.json'),
  'utf8'
));

if (!workflow.includes('if (!expiryResolution)')) {
  throw new Error('Sync must fail closed when expiryResolution is absent.');
}
if (!workflow.includes("requiredCapability: 'expiryResolution'")) {
  throw new Error('Compatibility failure Debug output must name expiryResolution.');
}
if (!workflow.includes("this.translate.instant('oa.status.syncProxyIncompatible')")) {
  throw new Error('Sync must display the incompatible-proxy operator message.');
}
if (!translations?.oa?.status?.syncProxyIncompatible) {
  throw new Error('Missing syncProxyIncompatible translation.');
}

const guardIndex = workflow.indexOf('if (!expiryResolution)');
const writeBackIndex = workflow.indexOf('await this.alma.writeBackOAUsernameBoth', guardIndex);
if (writeBackIndex < guardIndex) {
  throw new Error('Compatibility guard must run before Alma write-back.');
}

console.log('PASS: sync fails closed before Alma write-back when proxy expiry metadata is absent.');
