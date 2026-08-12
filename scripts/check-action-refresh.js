'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const main = fs.readFileSync(
  path.join(root, 'cloudapp/src/app/main/main.component.ts'),
  'utf8'
);
const alma = fs.readFileSync(
  path.join(root, 'cloudapp/src/app/services/alma-user.service.ts'),
  'utf8'
);
const translations = JSON.parse(fs.readFileSync(
  path.join(root, 'cloudapp/src/i18n/en.json'),
  'utf8'
));

function methodBody(signature, nextSignature) {
  const start = main.indexOf(signature);
  const end = main.indexOf(nextSignature, start + signature.length);
  assert.ok(start >= 0 && end > start, `Unable to inspect ${signature}`);
  return main.slice(start, end);
}

function assertOrder(text, first, second, label) {
  const firstIndex = text.indexOf(first);
  const secondIndex = text.indexOf(second);
  assert.ok(firstIndex >= 0, `${label} is missing ${first}`);
  assert.ok(secondIndex > firstIndex, `${label} must run ${first} before ${second}`);
}

assert.match(alma, /getFreshUser\(primaryId: string\)/);
assert.match(alma, /getFullUserRaw\(primaryId, true\)/);
assert.match(alma, /queryParams\['_'\] = Date\.now\(\)\.toString\(\)/);

const helper = methodBody(
  'private async refreshUserBeforeAction()',
  'async resendActivation()'
);
assert.match(helper, /await this\.alma\.getFreshUser\(primaryId\)/);
assert.match(helper, /this\.state\.setUser\(refreshedUser\)/);
assert.match(helper, /actionRefreshFailed/);

const resend = methodBody('async resendActivation()', 'async createOA()');
assertOrder(resend, 'await this.refreshUserBeforeAction()', 'resendActivationWorkflow(', 'Resend');
assert.match(resend, /if \(!refreshedUser\) return;/);
assert.match(resend, /resendActivationWorkflow\(\s*refreshedUser,/);

const create = methodBody('async createOA()', 'async syncOA()');
assertOrder(create, 'await this.refreshUserBeforeAction()', 'getEmail(refreshedUser)', 'Create');
assertOrder(create, 'await this.refreshUserBeforeAction()', 'createAccountWorkflow(', 'Create');
assert.match(create, /if \(!refreshedUser\) return;/);
assert.match(create, /createAccountWorkflow\(\s*refreshedUser,/);

const sync = methodBody('async syncOA()', 'Top-level Reset button');
assertOrder(sync, 'await this.refreshUserBeforeAction()', 'isEmailCreationBlocked(email)', 'Sync');
assertOrder(sync, 'await this.refreshUserBeforeAction()', 'syncAccountWorkflow(', 'Sync');
assert.match(sync, /if \(!refreshedUser\) return;/);
assert.match(sync, /syncAccountWorkflow\(\s*refreshedUser,/);

assert.equal(
  translations?.oa?.status?.actionRefreshFailed,
  'Action cancelled: the latest Alma user record could not be loaded. Try again.'
);

console.log('PASS: Create, Sync, and Resend refresh committed Alma data before acting.');
