'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { of } = require('rxjs');

function fixture(development, location, config) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const module = { exports: {} };
    cache.set(filename, module.exports);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true,
    } }).outputText;
    vm.runInNewContext(output, { module, exports: module.exports, console, window: { location },
      require(specifier) {
        if (specifier === '@angular/core') return { Injectable: () => () => {}, isDevMode: () => development };
        if (specifier === '@angular/common/http') return { HttpHeaders: class {} };
        if (specifier.startsWith('@exlibris/')) return {};
        if (specifier.startsWith('.')) return load(path.resolve(path.dirname(filename), `${specifier}.ts`));
        return require(specifier);
      } });
    return module.exports;
  }
  const { OAProxyService } = load(path.resolve(__dirname, '../cloudapp/src/app/services/oa-proxy.service.ts'));
  const calls = [];
  const service = new OAProxyService({ post(url) { calls.push(url); return of({ found: false }); } },
    { get: () => of(config) }, { getAuthToken: () => of('synthetic-token') });
  return { service, calls };
}

test('loopback ECA development overrides shared configuration without saving it', async () => {
  for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
    const { service, calls } = fixture(true, { hostname, port: '4200' }, { proxyBaseUrl: 'https://shared.example.test' });
    assert.equal(service.localProxyUrl, 'https://localhost:8443/oa-proxy');
    await service.verify({ username: 'synthetic' });
    assert.equal(calls[0], 'https://localhost:8443/oa-proxy/v1/oa/users/verify');
  }
});

test('production builds and non-ECA hosts retain configured HTTPS behavior', async () => {
  for (const [development, hostname, port] of [[false, 'localhost', '4200'], [true, 'app.example.test', '4200'],
    [true, 'localhost', '443'], [true, 'localhost.example.test', '4200']]) {
    const { service, calls } = fixture(development, { hostname, port }, { proxyBaseUrl: 'https://shared.example.test' });
    assert.equal(service.localProxyUrl, null);
    await service.verify({ username: 'synthetic' });
    assert.equal(calls[0], 'https://shared.example.test/v1/oa/users/verify');
  }
});
