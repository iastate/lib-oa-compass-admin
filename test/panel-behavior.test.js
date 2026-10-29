'use strict';

// Exercise component behavior with real RxJS and the repository TypeScript.
// Angular type/template compilation remains part of the production build;
// hosted keyboard and screen-reader acceptance is a separate check.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { Subject, of, throwError } = require('rxjs');

const root = path.resolve(__dirname, '..', 'cloudapp/src/app');
class TestEmitter extends Subject {
  emit(value) { this.next(value); }
}

function components(focused = []) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const module = { exports: {} };
    cache.set(filename, module.exports);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
        experimentalDecorators: true, emitDecoratorMetadata: false,
      },
    }).outputText;
    const decorator = () => () => {};
    vm.runInNewContext(output, {
      module, exports: module.exports, console, setTimeout, clearTimeout, URL,
      document: { getElementById: id => ({ focus: () => focused.push(id) }) },
      require(specifier) {
        if (specifier === '@angular/core') return {
          Component: decorator, Injectable: decorator, Input: decorator, Output: decorator,
          isDevMode: () => false,
          EventEmitter: TestEmitter,
          ChangeDetectionStrategy: { OnPush: 0 },
        };
        if (specifier.startsWith('@angular/') || specifier.startsWith('@exlibris/')) return {};
        if (specifier.startsWith('.')) return load(path.resolve(path.dirname(filename), `${specifier}.ts`));
        return require(specifier);
      },
    }, { filename });
    return module.exports;
  }
  return {
    Settings: load(path.join(root, 'components/settings/settings.component.ts')).SettingsComponent,
    Config: load(path.join(root, 'components/config/config.component.ts')).ConfigComponent,
    Main: load(path.join(root, 'main/main.component.ts')).MainComponent,
    Search: load(path.join(root, 'components/user-search/user-search.component.ts')).UserSearchComponent,
  };
}

for (const name of ['Settings', 'Config']) {
  function fixture(result = of({})) {
    const { [name]: Component } = components();
    const writes = [], navigations = [];
    const service = { set: value => { writes.push(value); return result; } };
    const router = { navigate: value => navigations.push([...value]) };
    const component = name === 'Settings'
      ? new Component(service, {}, router)
      : new Component(service, router);
    let closed = 0;
    component.closed.subscribe(() => closed += 1);
    return { component, writes, navigations, closed: () => closed };
  }

  test(`${name}: embedded Cancel closes the panel without navigation or saving`, () => {
    const view = fixture();
    view.component.embedded = true;
    view.component.onCancel();
    assert.equal(view.closed(), 1);
    assert.equal(view.navigations.length, 0);
    assert.equal(view.writes.length, 0);
  });

  test(`${name}: standalone Cancel returns to the main route`, () => {
    const view = fixture();
    view.component.onCancel();
    assert.deepEqual(view.navigations, [['']]);
    assert.equal(view.closed(), 0);
  });

  test(`${name}: successful embedded Save closes only after completion`, () => {
    const pending = new Subject();
    const view = fixture(pending);
    view.component.embedded = true;
    view.component.onSave();
    view.component.onSave();
    view.component.onCancel();
    assert.equal(view.writes.length, 1, 'saving must prevent duplicate submissions');
    assert.equal(view.closed(), 0);
    assert.equal(view.component.saving, true);
    pending.next({});
    pending.next({});
    assert.equal(view.component.saving, false);
    assert.equal(view.closed(), 1);
    assert.equal(view.navigations.length, 0);
  });

  test(`${name}: failed Save keeps the panel open with an error`, () => {
    const view = fixture(throwError(() => new Error('mock save failed')));
    view.component.embedded = true;
    view.component.onSave();
    assert.equal(view.component.saving, false);
    assert.equal(view.component.saved, false);
    assert.equal(view.component.error, 'mock save failed');
    assert.equal(view.closed(), 0);
    assert.equal(view.navigations.length, 0);
  });
}

test('panel toggles deny unauthorized callers and remain mutually exclusive', () => {
  const { Main } = components();
  const view = Object.create(Main.prototype);
  Object.assign(view, { isAuthorized: false, showSettings: false, showConfig: false });
  view.toggleSettings();
  view.toggleConfig();
  assert.equal(view.showSettings, false);
  assert.equal(view.showConfig, false);
  view.isAuthorized = true;
  view.toggleSettings();
  assert.equal(view.showSettings, true);
  view.toggleConfig();
  assert.equal(view.showSettings, false);
  assert.equal(view.showConfig, true);
  view.toggleConfig();
  assert.equal(view.showConfig, false);
});

test('search list selection emits only the selected user', () => {
  const { Search } = components();
  const view = new Search();
  const selected = [];
  view.userSelected.subscribe(value => selected.push(value));
  const user = { primary_id: 'example-user' };
  view.onSelectionChange({ options: [{ selected: false, value: {} }, { selected: true, value: user }] });
  assert.deepEqual(selected, [user]);
  view.onSelectionChange({ options: [{ selected: false, value: user }] });
  assert.equal(selected.length, 1);
});

test('closing a panel returns focus to its opening control', () => {
  const focused = [];
  const { Main } = components(focused);
  const view = Object.create(Main.prototype);
  Object.assign(view, { showSettings: true, showConfig: true });
  view.closeSettings();
  view.closeConfig();
  assert.equal(view.showSettings, false);
  assert.equal(view.showConfig, false);
  assert.deepEqual(focused, ['oa-settings-toggle', 'oa-config-toggle']);
});
