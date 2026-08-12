# System Design Document

## System context

OA Compass Admin is an Angular application executed by the Ex Libris Cloud App
host. It uses the Ex Libris SDK for operator context, Alma APIs, configuration,
settings, and short-lived authentication tokens. OpenAthens operations cross an
HTTPS boundary defined by the public OpenAPI document.

## Repository architecture

### Presentation layer

Components under `cloudapp/src/app/components` present configuration, user
search, account status, provisioning, settings, notifications, and shared user
context. `MainComponent` coordinates the application-level experience and
routes to focused screens.

### Application services

- `OperatorAuthorizationService` interprets the current Alma operator roles.
- `AlmaUserService` retrieves, normalizes, and updates Alma user records.
- `EntityContextService` tracks the user entity supplied by the Cloud App host.
- `OAProxyService` owns typed external API calls and token refresh behavior.
- `OAWorkflowService` coordinates lookup, creation, modification, and Alma
  synchronization.
- `StateService` exposes shared UI state.

### Models

Public TypeScript models describe Alma users, OpenAthens request/response
objects, account state, and institution settings. These models remain aligned
with the OpenAPI schemas without requiring generated or shared runtime code.

## External proxy boundary

The frontend calls an independently operated HTTPS service. The authoritative
interface is `docs/openapi/oa-proxy.openapi.yaml`, version `1.0.0`.

- `GET /health` is public and reports service availability plus the proxy
  version, full source commit, and immutable running-image digest.
- Every `/v1/oa/users/*` operation requires a bearer token.
- Supported operations verify, retrieve, create, modify, and resend activation.
- Create and modify responses can report requested, maximum, and applied expiry
  dates when the proxy enforces the OpenAthens five-year limit.
- Sync fails closed before Alma write-back when a proxy omits required
  `expiryResolution` metadata.
- The browser never receives or stores an OpenAthens service credential.

The frontend obtains a token from `CloudAppEventsService.getAuthToken()` and
sends it as an Authorization bearer value. `OAProxyService` caches the token
for the session, clears it on `401`, obtains a fresh value, and retries once.
Other failures propagate to the workflow layer for safe user-facing handling.

## Primary data flow

1. The Ex Libris host opens the app with operator and optional user context.
2. The authorization guard verifies the operator role.
3. The app loads institution configuration and normalizes field choices.
4. The operator selects an Alma user.
5. The workflow reads identity values and queries the external service.
6. The operator reviews the result and explicitly starts any mutation.
7. The workflow confirms that the refreshed OpenAthens expiry matches the
   proxy's applied expiry and reports any cap to the operator.
8. After a successful account operation, configured Alma fields are updated.
9. Status and notification components report the outcome without exposing
   tokens or sensitive response bodies.

## Configuration design

`CloudAppConfigService` stores institution-level configuration:

- HTTPS proxy base URL.
- Alma identifier type code.
- Optional email domain excluded from account creation.
- Primary and optional secondary username storage fields.

Configuration input is trimmed and normalized. Identifier codes allow letters,
digits, underscore, and hyphen. Email domains are compared case-insensitively.
An invalid proxy URL does not replace the checked-in HTTPS fallback.

## Authorization and privacy

The route guard and service calls serve different purposes: the guard controls
the frontend experience, while the bearer token authenticates each protected
service request. Neither is treated as a substitute for the other.

Frontend logs and issue reports must not contain tokens, Alma user payloads, or
OpenAthens account details. Error messages should guide the operator without
echoing sensitive request or response content.

## Build and verification

The Ex Libris CLI produces the frontend bundle. Repository checks also compare
manifests, lint the OpenAPI contract, verify canonical documentation, and scan
the tree for paths or capabilities outside the public boundary. CI has read-only
repository permission and runs only on GitHub-hosted infrastructure.

## Compatibility

The OpenAPI version remains `1.0.0` for the current route and payload contract.
Any incompatible route, security, request, or response change requires an
explicit contract version and coordinated frontend/service release decision.
