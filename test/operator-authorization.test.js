'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { BehaviorSubject, firstValueFrom, of } = require('rxjs');

const root = path.resolve(__dirname, '..', 'cloudapp/src/app');

function loadAuthorizationService() {
  const filename = path.join(root, 'services/operator-authorization.service.ts');
  const module = { exports: {} };
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
    },
  }).outputText;

  vm.runInNewContext(output, {
    module,
    exports: module.exports,
    require(specifier) {
      if (specifier === '@angular/core') {
        return { Injectable: () => target => target };
      }
      if (specifier === 'rxjs') return { BehaviorSubject, firstValueFrom, of };
      if (specifier.startsWith('@exlibris/')) return {};
      return require(specifier);
    },
  }, { filename });

  return module.exports.OperatorAuthorizationService;
}

function fixture({ primaryId = 'operator-1', user = {}, failure } = {}) {
  const Service = loadAuthorizationService();
  let reads = 0;
  const events = {
    getInitData: () => of({ user: { primaryId } }),
  };
  const alma = {
    async getUser(id) {
      reads += 1;
      assert.equal(id, primaryId.trim());
      if (failure) throw failure;
      return user;
    },
  };
  return {
    service: new Service(events, alma),
    reads: () => reads,
  };
}

test('User Administrator and User Manager roles authorize the Alma operator', async () => {
  for (const role of [
    { role_type: { desc: 'User Administrator' } },
    { role_type: { '@desc': 'User Manager' } },
    { role_type: { value: 'USER MANAGER' } },
    'User Administrator',
  ]) {
    const { service } = fixture({
      primaryId: ' operator-1 ',
      user: { user_role: [role] },
    });
    const result = await service.ensureAuthorized();
    assert.equal(result.authorized, true, JSON.stringify(role));
    assert.equal(result.operatorPrimaryId, 'operator-1');
  }
});

test('unrelated, empty, and unrecognized roles fail closed', async () => {
  for (const user of [
    { user_role: [{ role_type: { desc: 'Catalog Manager' } }] },
    { user_role: [] },
    {},
  ]) {
    const { service } = fixture({ user });
    const result = await service.ensureAuthorized();
    assert.equal(result.authorized, false);
    assert.equal(result.error, null);
  }
});

test('missing operator identity fails closed without reading an Alma user', async () => {
  const { service, reads } = fixture({ primaryId: '   ' });
  const result = await service.ensureAuthorized();
  assert.equal(result.authorized, false);
  assert.match(result.error, /Unable to determine/);
  assert.equal(reads(), 0);
});

test('Alma role lookup failure fails closed', async () => {
  const { service } = fixture({ failure: new Error('Alma lookup unavailable') });
  const result = await service.ensureAuthorized();
  assert.equal(result.authorized, false);
  assert.equal(result.roleNames.length, 0);
  assert.equal(result.error, 'Alma lookup unavailable');
});

test('authorization is cached and can be explicitly refreshed after role changes', async () => {
  let user = { user_role: [{ role_type: { desc: 'User Manager' } }] };
  const Service = loadAuthorizationService();
  let reads = 0;
  const service = new Service(
    { getInitData: () => of({ user: { primaryId: 'operator-1' } }) },
    { getUser: async () => { reads += 1; return user; } },
  );

  assert.equal((await service.ensureAuthorized()).authorized, true);
  user = { user_role: [{ role_type: { desc: 'Catalog Manager' } }] };
  assert.equal((await service.ensureAuthorized()).authorized, true);
  assert.equal(reads, 1);
  assert.equal((await service.ensureAuthorized(true)).authorized, false);
  assert.equal(reads, 2);
});

test('concurrent authorization checks share one Alma role lookup', async () => {
  let resolveUser;
  let reads = 0;
  const Service = loadAuthorizationService();
  const service = new Service(
    { getInitData: () => of({ user: { primaryId: 'operator-1' } }) },
    { getUser: () => {
      reads += 1;
      return new Promise(resolve => { resolveUser = resolve; });
    } },
  );

  const first = service.ensureAuthorized();
  const second = service.ensureAuthorized();
  await new Promise(resolve => setImmediate(resolve));
  resolveUser({ user_role: [{ role_type: { desc: 'User Administrator' } }] });
  const [firstResult, secondResult] = await Promise.all([first, second]);
  assert.equal(firstResult.authorized, true);
  assert.equal(secondResult, firstResult);
  assert.equal(reads, 1);
});
