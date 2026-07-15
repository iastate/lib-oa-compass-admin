# Contributing

Thank you for helping improve OA Compass Admin.

## Before opening an issue

- Search existing issues first.
- Do not include Alma user records, access tokens, API credentials, tenant
  identifiers, screenshots containing personal information, or infrastructure
  details.
- Report security concerns through the private process in `SECURITY.md`.

## Development workflow

1. Create a branch from the current public default branch.
2. Install the locked dependencies with `npm ci` using Node.js 22.
3. Keep changes within the public Angular, manifest, documentation, and OpenAPI
   boundary.
4. Run `npm run check` before opening a pull request.
5. Describe user-visible behavior, test coverage, and any OpenAPI impact.

Changes to `docs/openapi/oa-proxy.openapi.yaml` require coordinated review with
the external service owner. Do not add server code, credentials, infrastructure
automation, or operational records to this repository.

By contributing, you agree that your contribution is licensed under the
Apache License 2.0.
