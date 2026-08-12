# Canonical Code Registry

This registry defines stable public names and ownership for the OA Compass
Admin Cloud App. Rename or responsibility changes require coordinated updates
to code, tests, and this document.

## Application shell

| Symbol | Responsibility |
| --- | --- |
| `AppModule` | Angular module composition and shared dependencies. |
| `AppRoutingModule` | Public Cloud App route definitions. |
| `AppComponent` | Root application component. |
| `MainComponent` | Main operator workflow and navigation. |

## Components

| Component | Responsibility |
| --- | --- |
| `AppHeaderComponent` | Shared application title and navigation affordances. |
| `ConfigComponent` | Institution configuration editing and normalization. |
| `ProvisionComponent` | Account provisioning interaction. |
| `SettingsComponent` | User-level display preferences. |
| `StatusComponent` | Current workflow and account status. |
| `ToastComponent` | Transient success and error notifications. |
| `UserInfoComponent` | Selected Alma identity summary. |
| `UserSearchComponent` | Alma user discovery and selection. |
| `UserShellComponent` | Shared user-workflow layout. |

## Services and guard

| Symbol | Responsibility |
| --- | --- |
| `OperatorAuthorizationGuard` | Prevents unauthorized route activation. |
| `OperatorAuthorizationService` | Evaluates supported Alma operator roles. |
| `AlmaUserService` | Reads, normalizes, and updates Alma user data. |
| `AlmaWSRestService` | Typed wrapper for Alma REST interactions. |
| `EntityContextService` | Tracks the active Cloud App entity. |
| `OAProxyService` | Performs typed authenticated calls to the external API. |
| `OAWorkflowService` | Coordinates account and Alma synchronization flows. |
| `StateService` | Holds shared frontend state. |

## Public configuration

`OACompassConfig` contains:

| Field | Contract |
| --- | --- |
| `proxyBaseUrl` | HTTPS external service base URL. |
| `oaIdTypeCode` | Alma identifier type used for the OpenAthens username. |
| `disallowedEmailDomain` | Optional domain excluded from local account creation. |
| `oaPrimaryField` | Required primary username storage location. |
| `oaSecondaryField` | Optional secondary username storage location. |

`OAUsernameField` values are `job_description`, `identifier02`, and
`user_note`. `OASecondaryField` additionally supports `none`.

## External API operations

| Method and path | Operation ID | Authentication |
| --- | --- | --- |
| `GET /health` | `getHealth` | Public |
| `POST /v1/oa/users/verify` | `verifyUser` | Bearer token |
| `POST /v1/oa/users/get` | `getUser` | Bearer token |
| `POST /v1/oa/users/create` | `createUser` | Bearer token |
| `POST /v1/oa/users/modify` | `modifyUser` | Bearer token |
| `POST /v1/oa/users/resend-activation` | `resendActivation` | Bearer token |

The exact schemas, response codes, and reusable errors are canonical in
`docs/openapi/oa-proxy.openapi.yaml`. TypeScript model names remain stable while
OpenAPI version `1.0.0` is active.

`OAExpiryResolution` records the requested Alma expiry, the calculated
OpenAthens maximum, the applied date, and whether the request was capped. It is
optional additive metadata on create and modify responses.

## Manifest contract

`manifest.json` and `cloudapp/src/assets/manifest.json` must be byte-equivalent
JSON values. The canonical application ID is `iastate/lib-oa-compass-admin`,
the license URL identifies Apache-2.0, the app is not a widget, and the `USER`
entity opens the user workflow. Network sources are restricted by the checked-in
manifest.

## Repository invariants

- The package name is `@iastate/lib-oa-compass-admin` and remains private from
  npm publication.
- Package and lockfile version identify the current frontend release. Version
  `2.0.4` refreshes the committed Alma user before every OpenAthens action and
  fails closed when that refresh is unavailable, while retaining the OpenAPI
  `1.0.0` request contract.
- Only frontend code and public interface documentation are permitted.
- Public CI has read-only repository permission.
- The production service hostname is permitted only in required frontend
  configuration and manifest CSP values, never in the OpenAPI server example.
- Interface changes update the OpenAPI, TypeScript models, PB, SDD, and CCR in
  the same reviewed change.
