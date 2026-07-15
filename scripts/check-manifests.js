'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const rootManifest = readJson('manifest.json');
const assetManifest = readJson('cloudapp/src/assets/manifest.json');

assert.deepEqual(assetManifest, rootManifest, 'root and asset manifests must be identical');
assert.equal(rootManifest.id, 'iastate/lib-oa-compass-admin');
assert.equal(rootManifest.license, 'https://www.apache.org/licenses/LICENSE-2.0');
assert.ok(rootManifest.contentSecurity.connectSrc.includes('https://app.lib.iastate.edu'));
console.log('PASS: Cloud App manifests are identical and retain required public metadata.');
