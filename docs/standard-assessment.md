# Clean-Slate Standard Assessment

**Assessment date:** 2026-09-09  
**Repository commit reviewed:** `30166bd3a990d6f9e9a01a2eb4dc766eab628964`  
**Assessment mode:** Repository review plus remote commit verification

OA Compass Admin is an Ex Libris-hosted Angular Cloud App. It is intentionally
outside the default Django/VM/application-server pattern and outside the future
Library Staff Portal: Alma and Ex Libris provide the operator context and
short-lived Cloud App bearer token.

## Evidence reviewed

- `README.md`, `docs/SDD.md`, `docs/PB.md`, `docs/CCR.md`, `PLANS.md`, and
  `AGENTS.md`
- Angular components, authorization guard/service, OA proxy service, manifest,
  public OpenAPI contract, and public-boundary scripts
- Authenticated GitHub API verification confirmed remote `main` points to the
  reviewed commit
- `npm run check` passed: production build, manifest equality, OpenAPI lint,
  documentation consistency, synchronization checks, action-refresh checks,
  and public-boundary validation

The vendor-hosted Cloud App could not be interactively regression-tested from
this local session. The repository records an authenticated Alma regression as
an open follow-up; vendor publication and vendor-side rollback remain outside
the Library team's direct control.

## Standard comparison

| Standard area | Result | Evidence or exception |
| --- | --- | --- |
| Default Django/Python stack | Intentional exception | Angular 18/TypeScript is required by the Ex Libris Cloud App platform. |
| Hosting and deployment | Intentional vendor exception | Ex Libris builds, hosts, and publishes the Cloud App; university VM, Apache, Gunicorn, and local deployment-runner controls do not apply. |
| Data | Meets | The frontend does not own a persistent datastore and keeps OA credentials out of the browser. |
| Entra / Staff Portal | Intentional exception | Alma operator context and Ex Libris Cloud App tokens authenticate the caller. The future Library Staff Portal is not the authentication boundary for this vendor-hosted app. |
| Integration contract | Meets | The public OpenAPI contract is authoritative; typed services call the private proxy over HTTPS with bearer tokens, refresh once on `401`, and fail closed before Alma write-back when required expiry metadata is absent. |
| Authorization | Meets by application design | The guard requires Alma `User Administrator` or `User Manager` role and the proxy independently validates the Cloud App token. |
| Accessibility | Partially evidenced | Angular/Material UI and documented operator flow exist, but the tracked authenticated Alma regression and a current interactive accessibility review remain follow-up evidence. |
| Security and privacy | Meets | Public-boundary checks, HTTPS-only proxy configuration, short-lived tokens, no browser OA credentials, sanitized logs, manifest checks, and dependency scanning are documented. |
| CI/CD and artifacts | Meets for vendor scope | Reproducible `npm ci`/build/check and contract/manifest/boundary validation are present. Vendor publication and rollback are documented as vendor-controlled. |
| Health and observability | Intentional boundary | The frontend consumes the proxy health/API contract; it does not operate a separate service health endpoint. |
| AI independence | Meets | Build, release, contract, security, and operator procedures are documented in ordinary repository files. |

## Required follow-up

1. Complete the tracked authenticated Alma operator regression and record the
   result, including the required-role and denied-role cases.
2. Perform and retain a current interactive accessibility review in the Ex
   Libris-hosted test context.
3. Keep the public/private OpenAPI contract synchronized with the private proxy;
   treat contract drift as a coordinated release concern.
4. Keep vendor publication and rollback boundaries explicit; do not add local
   VM/container or Staff Portal requirements to this repository.
