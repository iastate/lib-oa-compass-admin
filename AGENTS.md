# Repository Agent Instructions

## Objective

Maintain the public OA Compass Admin Ex Libris Cloud App and its sanitized
external OA proxy contract. This repository must remain safe for vendors,
contributors, and public forks.

## Authority

Follow the current user request, then `docs/PB.md`, `docs/SDD.md`,
`docs/CCR.md`, `PLANS.md`, existing code/tests, and general best practices.
Preserve canonical names from the CCR unless an approved interface change
updates the canonical documents at the same time.

## Public Boundary

- Keep only Angular Cloud App code, public metadata, documentation, and the
  sanitized OpenAPI interface.
- Never add proxy implementation, credential handling, container automation,
  server configuration, infrastructure identifiers, or operational records.
- Keep OA API credentials and tenant-specific policy outside this repository.
- Treat `docs/openapi/oa-proxy.openapi.yaml` as the authoritative public
  interface. Coordinate interface changes with the private service owner.
- Preserve Cloud App JWT bearer authentication and HTTPS-only proxy settings
  unless the canonical design explicitly changes.

## Required Working Loop

1. Read the relevant canonical artifacts.
2. Make minimal, focused changes.
3. Update canonical documents when behavior or interfaces change.
4. Run `npm run check`.
5. Confirm the public-boundary and secret scans remain clean.

## Definition of Done

Requested frontend behavior is implemented, the production build and public
checks pass, manifests remain synchronized, documentation matches behavior,
and no private implementation or operational capability enters the repository.
