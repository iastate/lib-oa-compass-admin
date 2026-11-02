# Dependency assessment — LIBDEV-3281

Reviewed 2026-11-02, based on candidate 2.0.5 / parent commit 233a1c6.
This assessment covers the public Cloud App and its development/build tools.
It does not assess the independent external API service.

## Result and release impact

The fresh baseline npm audit reports 81 affected package entries: 33 high,
42 moderate, six low, zero critical. These counts include inherited parent
findings and are not counts of independent vulnerabilities or reachable exploits.
The dated inventory below records the candidate after compatible updates.

No residual-risk exception is approved by this document. Public issue
[#2](https://github.com/iastate/lib-oa-compass-admin/issues/2) requires every
critical/high finding to be remediated or have an owner-approved applicability
assessment and follow-up date. That approval remains pending. Passing the
existing critical-only CI gate does not establish high-finding acceptance.

The application owner should review the residual findings before release.
Updated dependencies require authenticated Alma regression before vendor
publication. The October local-service regression used the previous dependency
set and cannot be represented as acceptance of this SDK update.

## Compatible remediation

- Pin the four Ex Libris SDK/CLI/component packages to 2.1.0. npm metadata
  identifies this as the current published SDK set; its peer ranges retain
  Angular 18, TypeScript 5.5, UUID 11, and PostCSS 8.
- Update direct Lodash to 4.18.1, PostCSS to 8.5.32, and UUID to 11.1.1.
- Refresh selected vulnerable transitive packages within their declared version
  ranges: body-parser, compression, engine.io, fast-uri, follow-redirects,
  ip-address, js-yaml, launch-editor, nanoid, node-forge, picomatch, qs, rollup,
  source-map-js, undici, and webpack-dev-middleware.
- Retain existing tar, piscina, proxy-addr, and shell-quote overrides until
  vendor-supported dependencies remove the need for them. No forced audit fix,
  Angular major migration, or CI-threshold relaxation is included.

An npm suggested fix that downgrades the Cloud App SDK to 1.4.9 or moves Angular
to a different major is not a compatible remediation for this candidate.

## Applicability groups and proposed follow-up

All remaining package entries are mapped to these groups in the inventory.
The application maintainer owns dependency remediation and vendor coordination;
the application owner must approve any exception. Proposed review date for
every unresolved group: **2026-11-09**, or before release if earlier. This date
does not schedule a reminder or approve a release.

| Group | Evidence and applicability assessment | Disposition |
| --- | --- | --- |
| BROWSER | Angular browser framework packages and their frontend wrappers are part of the browser dependency graph. Treat them as potentially applicable; do not classify them as build-only. App templates use ngx-translate rather than Angular i18n attributes; source search found no i18n attribute bindings, innerHTML bindings, sanitizer bypass calls, or app SVG/MathML templates. This narrows observed app-owned attack paths but does not prove shared SDK paths safe. | Request vendor-supported Angular fixes/backports or a compatible framework migration plan. Owner approval pending; no broad non-applicability claim. |
| MIXED | SDK aggregate entries inherit browser and development-tool findings. Angular compiler tooling participates in compilation; SDK runtime behavior also needs review. npm peer dependencies can label build tools as production dependencies. | Track the underlying browser/tool findings; the aggregate package severity is not a separate exploit. Vendor coordination required. |
| DEVSERVER | Development HTTP/middleware, HMR, TLS helper, browser-test server, and development bundler dependencies. They are tooling rather than the static browser application, but remain relevant to a workstation running the official development server. | Apply compatible fixes where available. Keep local development on loopback and do not weaken host/origin validation. Remaining vendor-pinned paths need upstream updates and owner review. |
| BUILD | CLI, build transforms, CSS processing, dependency acquisition, scanners/schema parsers, filesystem/glob utilities, and related tool dependencies. Malicious source, inputs, registries, or downloaded content can still affect a build workstation or CI. | Compatible updates applied where possible. Assess remaining pinned/major-only fixes with the vendor; do not dismiss findings because tooling is absent from the hosted browser UI. |

### Angular conditions reviewed

- Angular i18n attribute XSS:
  [GHSA-g93w-mfhg-p222](https://github.com/advisories/GHSA-g93w-mfhg-p222)
  describes unsafe translated attribute bindings. None were found in app-owned
  templates. This is a scoped source observation, not SDK-wide proof.
- HTTP XSRF leakage:
  [GHSA-58c5-g7wp-6w37](https://github.com/advisories/GHSA-58c5-g7wp-6w37)
  and the follow-on audit advisory remain tracked. OAProxyService accepts only
  HTTPS base URLs and sends absolute HTTPS requests; app-owned code does not
  construct protocol-relative HttpClient URLs. SDK request paths are not fully
  assessed; do not infer that all Angular/common findings are inapplicable.
- SSR/transfer-cache/hydration findings remain listed under Angular packages.
  The generated SDK entry point bootstraps a browser AppModule; no app-owned SSR,
  hydration, or transfer-cache setup was found. No SSR deployment is evidenced
  by this repository. This limits those specific paths, not Angular XSS broadly.
- App-owned expiry formatting uses Date.toLocaleDateString with fixed options
  in AlmaUserService, rather than configurable Angular formatDate/digitsInfo.
  SDK formatting paths were not exhaustively reviewed.
- npm lists Angular 18.2.14 as the latest 18.x core release. Some high advisory
  patches start at 19.x or later. SDK 2.1.0 peer ranges still require 18.x, so
  an unreviewed Angular major jump would violate the verified compatibility set.

Sources: [Ex Libris SDK update guide](https://developers.exlibrisgroup.com/cloudapps/docs/updating/),
[Cloud App setup guide](https://developers.exlibrisgroup.com/cloudapps/started/),
published npm metadata for the exact packages, package-lock.json, app.module.ts,
services/oa-proxy.service.ts, services/alma-user.service.ts, and generated SDK
main/angular configuration. Registry and advisory state can change after this date.

## Vendor escalation draft — not submitted

> OA Compass Admin uses Cloud App SDK 2.1.0 with Angular 18.2.14 on Node 22.
> The current audit still reports high Angular/browser and vendor-pinned tooling
> findings after compatible updates. Please provide the supported remediation
> or backport plan, the intended supported Angular upgrade path, and an expected
> timeline. The dated package/advisory inventory below identifies the remaining
> paths. No credentials or institution data are needed for this compatibility
> assessment. Please confirm whether any documented SDK mitigations apply.

The maintainer must submit through the institution's chosen vendor channel;
this draft is not evidence of a vendor response or a submitted support case.

## Repeatable verification and completion gates

Run commands individually on one line from a clean candidate checkout:

```text
npm ci
npm audit --json
npm audit --audit-level=critical
npm run check
```

Retain dated counts, exact installed paths/versions and advisory identifiers;
classify SDK peer/tool dependencies by their execution context rather than the
dependency/devDependency label alone. A build or runtime exploit was not tested.

- Compatible updates and lockfile review: implemented in this candidate.
- Clean install, critical gate, production build, all 13 behavior tests,
  manifest equality, contract lint, documentation/sync/action-refresh checks,
  and public-boundary checks: passed locally on Node 22.
- All remaining packages classified: inventory below, generated from the audit.
- Vendor request: prepared, not submitted.
- Owner-approved high-risk applicability/exception decision: pending.
- Authenticated regression for this dependency set and release approval: pending.

Do not close issue #2 or claim the dependency tree is vulnerability-free from
these findings. LIBDEV-3281 can record completed triage/remediation work; its
final disposition must acknowledge the owner and vendor gates above.


## Dated candidate inventory

Baseline counts: {"info":0,"low":6,"moderate":42,"high":33,"critical":0,"total":81}.

Candidate counts: {"info":0,"low":6,"moderate":43,"high":20,"critical":0,"total":69}.

Classification totals: BUILD=41, BROWSER=10, MIXED=4, DEVSERVER=14.

No longer reported as affected package entries: `body-parser`, `compression`, `engine.io`, `fast-uri`, `follow-redirects`, `ip-address`, `js-yaml`, `launch-editor`, `lodash`, `nanoid`, `node-forge`, `source-map-js`, `undici`. This is audit resolution evidence, not a claim that these packages have no possible defects.

Newly reported package entries: `express`.

Assessed package-lock.json SHA-256: `02042a84899087df5b3d5f59e19f6e6aef685040e84fdd4ded1642c5a98a65a2`.

For each unresolved row, use the group assessment above; owner approval remains pending. Maintainer: application maintainer. Approval owner: application owner. Proposed review date: 2026-11-09 or before release. Advisory references are identifiers, not reproduced exploit instructions.

| Package | Severity | Affected installed versions | Group | Advisory or inherited source |
| --- | --- | --- | --- | --- |
| `@angular-devkit/architect` | moderate | 0.1802.14 | BUILD | `@angular-devkit/core` (inherited) |
| `@angular-devkit/build-angular` | high | 18.2.14 | BUILD | `@angular-devkit/architect` (inherited); `@angular-devkit/build-webpack` (inherited); `@angular-devkit/core` (inherited); `@angular/build` (inherited); `@angular/compiler-cli` (inherited); `@babel/core` (inherited); `@babel/runtime` (inherited); `@ngtools/webpack` (inherited); `@vitejs/plugin-basic-ssl` (inherited); `copy-webpack-plugin` (inherited); `esbuild` (inherited); `http-proxy-middleware` (inherited); `karma` (inherited); `picomatch` (inherited); `postcss` (inherited); `webpack` (inherited); `webpack-dev-middleware` (inherited); `webpack-dev-server` (inherited) |
| `@angular-devkit/build-webpack` | moderate | 0.1802.14 | BUILD | `@angular-devkit/architect` (inherited) |
| `@angular-devkit/core` | moderate | 18.2.14, 18.2.21 | BUILD | `ajv` (inherited); `picomatch` (inherited) |
| `@angular-devkit/schematics` | moderate | 18.2.14 | BUILD | `@angular-devkit/core` (inherited) |
| `@angular/animations` | moderate | 18.2.14 | BROWSER | `@angular/core` (inherited) |
| `@angular/build` | high | 18.2.14 | BUILD | `@angular-devkit/architect` (inherited); `@angular/compiler-cli` (inherited); `@babel/core` (inherited); `@vitejs/plugin-basic-ssl` (inherited); `esbuild` (inherited); `picomatch` (inherited); `rollup` (inherited); `vite` (inherited) |
| `@angular/cdk` | moderate | 18.2.14 | BROWSER | `@angular/common` (inherited); `@angular/core` (inherited) |
| `@angular/cli` | high | 18.2.14 | BUILD | `@angular-devkit/architect` (inherited); `@angular-devkit/core` (inherited); `@angular-devkit/schematics` (inherited); `@inquirer/prompts` (inherited); `@listr2/prompt-adapter-inquirer` (inherited); `@schematics/angular` (inherited); `pacote` (inherited) |
| `@angular/common` | high | 18.2.14 | BROWSER | `@angular/core` (inherited); [GHSA-58c5-g7wp-6w37](https://github.com/advisories/GHSA-58c5-g7wp-6w37); [GHSA-48r7-hpm6-gfxm](https://github.com/advisories/GHSA-48r7-hpm6-gfxm); [GHSA-39pv-4j6c-2g6v](https://github.com/advisories/GHSA-39pv-4j6c-2g6v); [GHSA-p3vc-36g9-x9gr](https://github.com/advisories/GHSA-p3vc-36g9-x9gr); [GHSA-q6f4-qqrg-jv6x](https://github.com/advisories/GHSA-q6f4-qqrg-jv6x); [GHSA-jhpw-976m-542j](https://github.com/advisories/GHSA-jhpw-976m-542j); [GHSA-p297-fm68-3q8c](https://github.com/advisories/GHSA-p297-fm68-3q8c); [GHSA-jfgx-762w-99vr](https://github.com/advisories/GHSA-jfgx-762w-99vr) |
| `@angular/compiler` | high | 18.2.14 | BROWSER | `@angular/core` (inherited); [GHSA-g93w-mfhg-p222](https://github.com/advisories/GHSA-g93w-mfhg-p222); [GHSA-jrmj-c5cx-3cw6](https://github.com/advisories/GHSA-jrmj-c5cx-3cw6); [GHSA-v4hv-rgfq-gp49](https://github.com/advisories/GHSA-v4hv-rgfq-gp49); [GHSA-58w9-8g37-x9v5](https://github.com/advisories/GHSA-58w9-8g37-x9v5); [GHSA-f3m7-gqxr-g87x](https://github.com/advisories/GHSA-f3m7-gqxr-g87x); [GHSA-jj27-h5hq-8x99](https://github.com/advisories/GHSA-jj27-h5hq-8x99); [GHSA-hh8m-fm6v-7cvg](https://github.com/advisories/GHSA-hh8m-fm6v-7cvg) |
| `@angular/compiler-cli` | moderate | 18.2.14 | BUILD | `@angular/compiler` (inherited); `@babel/core` (inherited) |
| `@angular/core` | high | 18.2.14 | BROWSER | [GHSA-prjf-86w9-mfqv](https://github.com/advisories/GHSA-prjf-86w9-mfqv); [GHSA-g93w-mfhg-p222](https://github.com/advisories/GHSA-g93w-mfhg-p222); [GHSA-jrmj-c5cx-3cw6](https://github.com/advisories/GHSA-jrmj-c5cx-3cw6); [GHSA-f3m7-gqxr-g87x](https://github.com/advisories/GHSA-f3m7-gqxr-g87x); [GHSA-692r-grfm-v8x7](https://github.com/advisories/GHSA-692r-grfm-v8x7); [GHSA-rgjc-h3x7-9mwg](https://github.com/advisories/GHSA-rgjc-h3x7-9mwg); [GHSA-jj27-h5hq-8x99](https://github.com/advisories/GHSA-jj27-h5hq-8x99); [GHSA-hh8m-fm6v-7cvg](https://github.com/advisories/GHSA-hh8m-fm6v-7cvg) |
| `@angular/forms` | moderate | 18.2.14 | BROWSER | `@angular/common` (inherited); `@angular/core` (inherited); `@angular/platform-browser` (inherited) |
| `@angular/material` | moderate | 18.2.14 | BROWSER | `@angular/animations` (inherited); `@angular/cdk` (inherited); `@angular/common` (inherited); `@angular/core` (inherited); `@angular/forms` (inherited); `@angular/platform-browser` (inherited) |
| `@angular/platform-browser` | moderate | 18.2.14 | BROWSER | `@angular/animations` (inherited); `@angular/common` (inherited); `@angular/core` (inherited) |
| `@angular/platform-browser-dynamic` | moderate | 18.2.14 | BROWSER | `@angular/common` (inherited); `@angular/compiler` (inherited); `@angular/core` (inherited); `@angular/platform-browser` (inherited) |
| `@angular/router` | high | 18.2.14 | BROWSER | `@angular/common` (inherited); `@angular/core` (inherited); `@angular/platform-browser` (inherited); [GHSA-ff3f-86qr-9cv3](https://github.com/advisories/GHSA-ff3f-86qr-9cv3); [GHSA-62vg-58rm-qff7](https://github.com/advisories/GHSA-62vg-58rm-qff7) |
| `@babel/core` | low | 7.25.2 | BUILD | [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) |
| `@babel/runtime` | moderate | 7.25.0 | MIXED | [GHSA-968p-4wvh-cqc8](https://github.com/advisories/GHSA-968p-4wvh-cqc8) |
| `@exlibris/eca-components` | moderate | 2.1.0 | MIXED | `@exlibris/exl-cloudapp-angular-lib` (inherited) |
| `@exlibris/exl-cloudapp-angular-lib` | high | 2.1.0 | MIXED | `@angular-devkit/build-angular` (inherited); `@angular-devkit/core` (inherited); `@angular/animations` (inherited); `@angular/cdk` (inherited); `@angular/cli` (inherited); `@angular/common` (inherited); `@angular/compiler` (inherited); `@angular/compiler-cli` (inherited); `@angular/core` (inherited); `@angular/forms` (inherited); `@angular/material` (inherited); `@angular/platform-browser` (inherited); `@angular/platform-browser-dynamic` (inherited); `@angular/router` (inherited) |
| `@exlibris/exl-cloudapp-base` | moderate | 2.1.0 | MIXED | `@exlibris/exl-cloudapp-angular-lib` (inherited) |
| `@exlibris/exl-cloudapp-cli` | high | 2.1.0 | BUILD | `@exlibris/exl-cloudapp-angular-lib` (inherited); `@exlibris/exl-cloudapp-base` (inherited); `glob` (inherited); `js-beautify` (inherited) |
| `@inquirer/editor` | low | 2.2.0 | BUILD | `external-editor` (inherited) |
| `@inquirer/prompts` | low | 5.3.8 | BUILD | `@inquirer/editor` (inherited) |
| `@listr2/prompt-adapter-inquirer` | low | 2.0.15 | BUILD | `@inquirer/prompts` (inherited) |
| `@ngtools/webpack` | moderate | 18.2.14 | BUILD | `@angular/compiler-cli` (inherited) |
| `@schematics/angular` | moderate | 18.2.14 | BUILD | `@angular-devkit/core` (inherited); `@angular-devkit/schematics` (inherited) |
| `@sigstore/core` | moderate | 1.1.0 | BUILD | [GHSA-jfc7-64v2-mr8c](https://github.com/advisories/GHSA-jfc7-64v2-mr8c) |
| `@sigstore/sign` | moderate | 2.3.2 | BUILD | `@sigstore/core` (inherited) |
| `@sigstore/tuf` | moderate | 2.3.4 | BUILD | `tuf-js` (inherited) |
| `@sigstore/verify` | moderate | 1.2.1 | BUILD | `@sigstore/core` (inherited) |
| `@tufjs/models` | moderate | 2.0.1 | BUILD | `minimatch` (inherited) |
| `@vitejs/plugin-basic-ssl` | moderate | 1.1.0 | DEVSERVER | `vite` (inherited) |
| `ajv` | moderate | 8.17.1 | BUILD | [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) |
| `brace-expansion` | high | 2.1.2, 1.1.16 | BUILD | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg); [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895); [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr); [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7); [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) |
| `copy-webpack-plugin` | moderate | 12.0.2 | BUILD | `serialize-javascript` (inherited) |
| `editorconfig` | moderate | 1.0.7 | BUILD | `minimatch` (inherited) |
| `esbuild` | moderate | 0.21.5, 0.23.0 | DEVSERVER | [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) |
| `express` | moderate | 4.22.2 | DEVSERVER | `qs` (inherited) |
| `external-editor` | low | 3.1.0 | BUILD | `tmp` (inherited) |
| `glob` | high | 10.4.5, 7.2.3 | BUILD | [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2); [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4); `minimatch` (inherited) |
| `http-proxy-middleware` | moderate | 3.0.3 | DEVSERVER | [GHSA-9gqv-wp59-fq42](https://github.com/advisories/GHSA-9gqv-wp59-fq42); [GHSA-4www-5p9h-95mh](https://github.com/advisories/GHSA-4www-5p9h-95mh); [GHSA-64mm-vxmg-q3vj](https://github.com/advisories/GHSA-64mm-vxmg-q3vj) |
| `ignore-walk` | moderate | 6.0.5 | BUILD | `minimatch` (inherited) |
| `js-beautify` | moderate | 1.15.4 | BUILD | `editorconfig` (inherited) |
| `karma` | moderate | 6.4.4 | DEVSERVER | `glob` (inherited); `minimatch` (inherited); `rimraf` (inherited) |
| `karma-coverage` | moderate | 2.2.1 | DEVSERVER | `minimatch` (inherited) |
| `karma-jasmine` | moderate | 5.1.0 | DEVSERVER | `karma` (inherited) |
| `karma-jasmine-html-reporter` | moderate | 2.1.0 | DEVSERVER | `karma` (inherited); `karma-jasmine` (inherited) |
| `minimatch` | moderate | 3.1.5, 9.0.9 | BUILD | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) |
| `npm-packlist` | moderate | 8.0.2 | BUILD | `ignore-walk` (inherited) |
| `pacote` | high | 18.0.6 | BUILD | [GHSA-w4pp-8pjf-rmxw](https://github.com/advisories/GHSA-w4pp-8pjf-rmxw); `npm-packlist` (inherited); `sigstore` (inherited) |
| `picomatch` | high | 4.0.2 | BUILD | [GHSA-3v7f-55p6-f55p](https://github.com/advisories/GHSA-3v7f-55p6-f55p); [GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) |
| `postcss` | high | 8.4.41 | BUILD | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93); [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q); [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp); [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) |
| `postcss-selector-parser` | moderate | 7.1.4 | BUILD | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) |
| `qs` | moderate | 6.15.4 | DEVSERVER | [GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g); [GHSA-6pq8-jhm2-2vcw](https://github.com/advisories/GHSA-6pq8-jhm2-2vcw) |
| `rimraf` | moderate | 3.0.2, 5.0.10 | BUILD | `glob` (inherited) |
| `rollup` | high | 4.22.4 | BUILD | [GHSA-mw96-cpmx-2vgc](https://github.com/advisories/GHSA-mw96-cpmx-2vgc) |
| `serialize-javascript` | high | 6.0.2 | BUILD | [GHSA-5c6j-r48x-rmvq](https://github.com/advisories/GHSA-5c6j-r48x-rmvq); [GHSA-qj8w-gfj5-8c6v](https://github.com/advisories/GHSA-qj8w-gfj5-8c6v); [GHSA-m5mm-p8h7-m29v](https://github.com/advisories/GHSA-m5mm-p8h7-m29v) |
| `sigstore` | high | 2.3.1 | BUILD | `@sigstore/core` (inherited); `@sigstore/sign` (inherited); `@sigstore/tuf` (inherited); `@sigstore/verify` (inherited); [GHSA-52v5-jr5w-gjxr](https://github.com/advisories/GHSA-52v5-jr5w-gjxr) |
| `sockjs` | moderate | 0.3.24 | DEVSERVER | `uuid` (inherited) |
| `tmp` | high | 0.0.33 | BUILD | [GHSA-52f5-9888-hmc6](https://github.com/advisories/GHSA-52f5-9888-hmc6); [GHSA-ph9p-34f9-6g65](https://github.com/advisories/GHSA-ph9p-34f9-6g65) |
| `tuf-js` | moderate | 2.2.1 | BUILD | `@tufjs/models` (inherited) |
| `uuid` | moderate | 8.3.2 | DEVSERVER | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) |
| `vite` | high | 5.4.14, 5.4.21 | DEVSERVER | [GHSA-x574-m823-4x7w](https://github.com/advisories/GHSA-x574-m823-4x7w); [GHSA-356w-63v5-8wf4](https://github.com/advisories/GHSA-356w-63v5-8wf4); [GHSA-859w-5945-r5v3](https://github.com/advisories/GHSA-859w-5945-r5v3); [GHSA-xcj6-pq6g-qj4x](https://github.com/advisories/GHSA-xcj6-pq6g-qj4x); [GHSA-g4jq-h2w9-997c](https://github.com/advisories/GHSA-g4jq-h2w9-997c); [GHSA-jqfw-vq24-v9c3](https://github.com/advisories/GHSA-jqfw-vq24-v9c3); [GHSA-93m4-6634-74q7](https://github.com/advisories/GHSA-93m4-6634-74q7); [GHSA-4r4m-qw57-chr8](https://github.com/advisories/GHSA-4r4m-qw57-chr8); [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9); [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3); [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv); [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw); [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm); [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw); [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22); [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff); `esbuild` (inherited) |
| `webpack` | low | 5.94.0 | BUILD | [GHSA-8fgc-7cc6-rx7x](https://github.com/advisories/GHSA-8fgc-7cc6-rx7x); [GHSA-38r7-794h-5758](https://github.com/advisories/GHSA-38r7-794h-5758) |
| `webpack-dev-middleware` | high | 7.4.2 | DEVSERVER | [GHSA-g84c-rxfj-3j2c](https://github.com/advisories/GHSA-g84c-rxfj-3j2c) |
| `webpack-dev-server` | moderate | 5.0.4 | DEVSERVER | [GHSA-9jgg-88mc-972h](https://github.com/advisories/GHSA-9jgg-88mc-972h); [GHSA-4v9v-hfq4-rm2v](https://github.com/advisories/GHSA-4v9v-hfq4-rm2v); [GHSA-79cf-xcqc-c78w](https://github.com/advisories/GHSA-79cf-xcqc-c78w); [GHSA-mx8g-39q3-5c79](https://github.com/advisories/GHSA-mx8g-39q3-5c79); [GHSA-f5vj-f2hx-8m93](https://github.com/advisories/GHSA-f5vj-f2hx-8m93); [GHSA-m28w-2pqf-7qgj](https://github.com/advisories/GHSA-m28w-2pqf-7qgj); `rimraf` (inherited); `sockjs` (inherited) |

### Exact affected lockfile paths

- `@angular-devkit/architect`: `node_modules/@angular-devkit/architect`.
- `@angular-devkit/build-angular`: `node_modules/@angular-devkit/build-angular`.
- `@angular-devkit/build-webpack`: `node_modules/@angular-devkit/build-webpack`.
- `@angular-devkit/core`: `node_modules/@angular-devkit/architect/node_modules/@angular-devkit/core`, `node_modules/@angular-devkit/build-angular/node_modules/@angular-devkit/core`, `node_modules/@angular-devkit/core`, `node_modules/@angular-devkit/schematics/node_modules/@angular-devkit/core`, `node_modules/@angular/cli/node_modules/@angular-devkit/core`, `node_modules/@schematics/angular/node_modules/@angular-devkit/core`.
- `@angular-devkit/schematics`: `node_modules/@angular-devkit/schematics`.
- `@angular/animations`: `node_modules/@angular/animations`.
- `@angular/build`: `node_modules/@angular/build`.
- `@angular/cdk`: `node_modules/@angular/cdk`.
- `@angular/cli`: `node_modules/@angular/cli`.
- `@angular/common`: `node_modules/@angular/common`.
- `@angular/compiler`: `node_modules/@angular/compiler`.
- `@angular/compiler-cli`: `node_modules/@angular/compiler-cli`.
- `@angular/core`: `node_modules/@angular/core`.
- `@angular/forms`: `node_modules/@angular/forms`.
- `@angular/material`: `node_modules/@angular/material`.
- `@angular/platform-browser`: `node_modules/@angular/platform-browser`.
- `@angular/platform-browser-dynamic`: `node_modules/@angular/platform-browser-dynamic`.
- `@angular/router`: `node_modules/@angular/router`.
- `@babel/core`: `node_modules/@babel/core`.
- `@babel/runtime`: `node_modules/@babel/runtime`.
- `@exlibris/eca-components`: `node_modules/@exlibris/eca-components`.
- `@exlibris/exl-cloudapp-angular-lib`: `node_modules/@exlibris/exl-cloudapp-angular-lib`.
- `@exlibris/exl-cloudapp-base`: `node_modules/@exlibris/exl-cloudapp-base`.
- `@exlibris/exl-cloudapp-cli`: `node_modules/@exlibris/exl-cloudapp-cli`.
- `@inquirer/editor`: `node_modules/@inquirer/editor`.
- `@inquirer/prompts`: `node_modules/@inquirer/prompts`.
- `@listr2/prompt-adapter-inquirer`: `node_modules/@listr2/prompt-adapter-inquirer`.
- `@ngtools/webpack`: `node_modules/@ngtools/webpack`.
- `@schematics/angular`: `node_modules/@schematics/angular`.
- `@sigstore/core`: `node_modules/@sigstore/core`.
- `@sigstore/sign`: `node_modules/@sigstore/sign`.
- `@sigstore/tuf`: `node_modules/@sigstore/tuf`.
- `@sigstore/verify`: `node_modules/@sigstore/verify`.
- `@tufjs/models`: `node_modules/@tufjs/models`.
- `@vitejs/plugin-basic-ssl`: `node_modules/@vitejs/plugin-basic-ssl`.
- `ajv`: `node_modules/ajv`.
- `brace-expansion`: `node_modules/brace-expansion`, `node_modules/karma-coverage/node_modules/brace-expansion`, `node_modules/karma/node_modules/brace-expansion`, `node_modules/rimraf/node_modules/brace-expansion`.
- `copy-webpack-plugin`: `node_modules/copy-webpack-plugin`.
- `editorconfig`: `node_modules/editorconfig`.
- `esbuild`: `node_modules/@angular/build/node_modules/vite/node_modules/esbuild`, `node_modules/esbuild`, `node_modules/vite/node_modules/esbuild`.
- `express`: `node_modules/express`.
- `external-editor`: `node_modules/external-editor`.
- `glob`: `node_modules/glob`, `node_modules/karma/node_modules/glob`, `node_modules/rimraf/node_modules/glob`.
- `http-proxy-middleware`: `node_modules/http-proxy-middleware`.
- `ignore-walk`: `node_modules/ignore-walk`.
- `js-beautify`: `node_modules/js-beautify`.
- `karma`: `node_modules/karma`.
- `karma-coverage`: `node_modules/karma-coverage`.
- `karma-jasmine`: `node_modules/karma-jasmine`.
- `karma-jasmine-html-reporter`: `node_modules/karma-jasmine-html-reporter`.
- `minimatch`: `node_modules/karma-coverage/node_modules/minimatch`, `node_modules/karma/node_modules/minimatch`, `node_modules/minimatch`, `node_modules/rimraf/node_modules/minimatch`.
- `npm-packlist`: `node_modules/npm-packlist`.
- `pacote`: `node_modules/pacote`.
- `picomatch`: `node_modules/picomatch`.
- `postcss`: `node_modules/@angular-devkit/build-angular/node_modules/postcss`.
- `postcss-selector-parser`: `node_modules/postcss-selector-parser`.
- `qs`: `node_modules/qs`.
- `rimraf`: `node_modules/rimraf`, `node_modules/webpack-dev-server/node_modules/rimraf`.
- `rollup`: `node_modules/rollup`.
- `serialize-javascript`: `node_modules/serialize-javascript`.
- `sigstore`: `node_modules/sigstore`.
- `sockjs`: `node_modules/sockjs`.
- `tmp`: `node_modules/tmp`.
- `tuf-js`: `node_modules/tuf-js`.
- `uuid`: `node_modules/sockjs/node_modules/uuid`.
- `vite`: `node_modules/@angular/build/node_modules/vite`, `node_modules/vite`.
- `webpack`: `node_modules/webpack`.
- `webpack-dev-middleware`: `node_modules/webpack-dev-middleware`.
- `webpack-dev-server`: `node_modules/webpack-dev-server`.
