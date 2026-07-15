# OA Compass Admin

OA Compass Admin is an Ex Libris Cloud App for authorized Alma operators to
find Alma users and provision or maintain their OpenAthens Compass accounts.
The public frontend communicates with an institution-operated service through
the API defined in [`docs/openapi/oa-proxy.openapi.yaml`](docs/openapi/oa-proxy.openapi.yaml).

## Repository boundary

This public repository contains the Angular Cloud App, Ex Libris manifests,
translations, public documentation, and the sanitized API contract. The
service implementation, institutional policy, credentials, and infrastructure
are maintained separately and are not accepted in issues or contributions.

## Requirements

- Node.js 22
- npm 10 or later
- Ex Libris Cloud App development access for interactive testing

## Develop and build

```bash
npm ci
npm start
```

`npm start` runs the Ex Libris Cloud App development server. Use the Cloud App
configuration view to set an HTTPS `proxyBaseUrl` for an authorized test
service. Plain HTTP proxy URLs are rejected by the frontend.

Create a production bundle and run all repository checks with:

```bash
npm run build
npm run check
```

The complete check builds the Cloud App, compares both manifests, lints the
OpenAPI document, verifies canonical documentation, and enforces the public
repository boundary.

## Operator workflow

1. Open the app from an Alma user record or search for a user.
2. The app verifies that the operator has an authorized Alma role.
3. Review the Alma identity and any matching OpenAthens account.
4. Create, update, or resend activation when appropriate.
5. Store the resulting OpenAthens username in the configured Alma field or
   identifier.

Every account operation sends a short-lived Ex Libris Cloud App bearer token.
The health operation is public; all `/v1/oa/users/*` operations require
authentication. Request and response shapes are documented in the OpenAPI
contract.

## Configuration

The configuration view supports:

- `proxyBaseUrl`: HTTPS base URL for the institutional proxy.
- `oaIdTypeCode`: Alma identifier type used for OpenAthens usernames.
- `disallowedEmailDomain`: optional domain excluded from local account creation.
- Primary and optional secondary Alma fields for the OpenAthens username.

The checked-in manifest allows the Alma API and the institutional service used
by this app. Root and asset copies of the manifest must remain identical.

## Project map

- `cloudapp/src/app/` — Angular components, services, guards, and models.
- `cloudapp/src/assets/` — Ex Libris manifest and application icon.
- `cloudapp/src/i18n/` — translated interface strings.
- `docs/openapi/` — authoritative public API contract.
- `docs/PB.md`, `docs/SDD.md`, `docs/CCR.md` — detailed canonical documents.
- `PLANS.md` — public development and release plan.

See [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a change and
[SECURITY.md](SECURITY.md) for private vulnerability reporting.
