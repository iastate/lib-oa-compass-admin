# OA Compass Admin Public Plan

## Current objective

Maintain the clean, frontend-only OA Compass Admin repository with a stable
public OpenAPI boundary and contributor-safe automation. The clean-history
cutover and coordinated version `2.0.0` release are complete. Frontend patch
`2.0.1` resolves the critical dependency finding reported during Ex Libris
review without changing the external interface or proxy deployment.

## Milestones

### M1 — Frontend workflow

- Authorized Alma operator experience.
- User search and entity-context handling.
- OpenAthens account lookup, creation, modification, and activation resend.
- Configurable Alma username synchronization.
- Status, notification, translation, and settings support.
- Status: Implemented. Automated release validation passed; authenticated Alma
  operator regression remains tracked in issue `#1`.

### M2 — Public interface

- Sanitized OpenAPI version `1.0.0` covering health and authenticated user
  operations.
- TypeScript request and response models aligned with the documented API.
- HTTPS-only frontend configuration and Cloud App bearer-token behavior.
- Status: Implemented. Cross-repository equality passed as a blocking `2.0.0`
  release gate.

### M3 — Public repository boundary

- Frontend-only package scripts and lockfile.
- GitHub-hosted read-only CI with build, documentation, contract, manifest,
  boundary, workflow, and secret checks.
- Apache-2.0 licensing, contribution guidance, security policy, and safe issue
  forms.
- Detailed public PB, SDD, CCR, and API documentation.
- Status: Clean public history published through T21 on 2026-07-21.

## Tasks

### T20 — Build the sanitized public candidate

- Produce a parentless candidate containing only approved frontend and public
  interface artifacts.
- Remove service implementation and operational capabilities.
- Validate a clean install, production build, manifests, OpenAPI, documentation,
  public boundary, workflow syntax, and secret scan.
- Prove a fresh single-branch clone contains one root commit and the approved
  inventory.
- Status: Completed. Clean install, production build, manifest, OpenAPI,
  documentation, boundary, workflow, and secret checks pass. The one-commit,
  one-root candidate became the replacement public history through T21.

### T21 — Publish clean public history

- Replace the public default branch only after the restricted service has
  completed independent release and recovery validation.
- Restore branch protections and public CI, then audit repository settings and
  all public refs.
- Existing clones and forks cannot be recalled; clearly communicate the need to
  re-clone after history replacement.
- Status: Completed on 2026-07-21 after restricted-service release and recovery
  validation, independent reconstruction of the retained migration evidence,
  and explicit repository/service-owner authorization. The public default
  branch was replaced with the sanitized root, legacy combined-history tags and
  releases were removed, CI was revalidated, and repository settings were
  audited.

### T22 — Coordinated 2.0.0 release

- Tag compatible frontend and service commits.
- Record public commit, service commit, OpenAPI version, and immutable service
  release identifier in the compatibility record.
- Run old/new compatibility checks and a post-release public-boundary audit.
- Status: Completed on 2026-07-22. Coordinated annotated tags and GitHub
  releases were published, the proxy image passed its fixed-critical scan and
  immutable deployment, production health/auth/CORS/log checks passed, and the
  running digest was independently verified. Manual Alma regression and
  frontend dependency remediation remain explicitly tracked in issues `#1`
  and `#2`.

### T23 — Ex Libris audit remediation and 2.0.1 patch

- Keep the Ex Libris `2.0.2` SDK and application on the Angular 18.2 line.
- Pin the transitive build-time `tar` package to patched version `7.5.21` and
  reject critical npm audit findings in public CI.
- Publish an interface-compatible frontend-only `2.0.1` release after clean
  install, build, documentation, workflow, boundary, and secret checks pass.
- Retain remaining non-critical upstream findings in issue `#2` and remove the
  temporary override when an official Ex Libris SDK update supersedes it.
- Status: Completed on 2026-07-22. Public release `v2.0.1` pins every affected
  path to `tar@7.5.21`; clean-clone and tag CI reported zero critical findings
  and passed the build, documentation, workflow, boundary, and secret checks.
  Remaining non-critical upstream findings continue under issue `#2`.

## Acceptance criteria

- `npm ci` and `npm run check` pass on Node.js 22.
- `npm audit --audit-level=critical` reports zero critical vulnerabilities.
- A fresh candidate clone contains one root commit.
- Only approved public files are present.
- Root and bundled manifests match.
- OpenAPI version remains `1.0.0` and contains no production service hostname.
- Automated scans find no secrets or prohibited operational capability.
- The public default branch begins with the sanitized T20 root and exposes only
  approved public refs.

## Decision record

- The Angular application and sanitized OpenAPI are public.
- The external service is represented only by its HTTP interface.
- Detailed public design documents are retained for maintainers and vendors.
- The institution-facing manifest and HTTPS fallback remain part of the public
  frontend because they are required application configuration.
- Clean-history publication is a separate, explicitly authorized task.
- Private operational evidence is retained outside this public repository; the
  public tree records only the external API boundary and migration state.
- The owner accepted automated release validation for `2.0.0`; manual Alma
  regression and legacy frontend dependency remediation remain public,
  accountable follow-up work rather than implied release accomplishments.
- The owner approved a temporary `tar@7.5.21` override for frontend release
  `2.0.1` after isolated clean-install and full-build validation. The proxy
  remains at compatible release `2.0.0` because the API is unchanged.
- Expiry dates beyond OpenAthens' five-year maximum are capped by the proxy,
  returned as additive `expiryResolution` metadata, verified after sync, and
  reported explicitly to the operator.
