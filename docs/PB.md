# Project Brief: OA Compass Admin

## Purpose

OA Compass Admin gives authorized Alma operators a guided workflow for finding
an Alma user and creating or maintaining the corresponding OpenAthens Compass
account. It reduces duplicate data entry while keeping the operator in control
of each account-changing action.

## Users and stakeholders

- Alma operators with the User Administrator or User Manager role.
- Library application owners responsible for configuration and releases.
- Open-source contributors and Ex Libris reviewers working only with public
  frontend code and interface documentation.
- The separately administered service team that implements the OpenAPI
  contract.

## Goals

- Present Alma identity and OpenAthens account state in one Cloud App.
- Require an authorized Alma role before exposing account-management actions.
- Use a short-lived Cloud App bearer token for every protected service call.
- Support account lookup, creation, modification, and activation-email resend.
- Store the OpenAthens username in configurable Alma fields.
- Keep public contributions independent from credentials and service internals.

## Non-goals

- Publishing or managing OpenAthens credentials.
- Implementing the external service inside the Cloud App repository.
- Providing general-purpose identity administration outside the documented
  operator workflow.
- Changing Alma authorization roles or OpenAthens policy from the browser.

## Public/private boundary

The public repository owns the Angular Cloud App, Ex Libris manifests,
translations, user-facing configuration, detailed public design documents, and
the sanitized OpenAPI contract. A separate restricted system owns service
implementation, institutional policy mappings, credentials, and operations.
The repositories share an HTTP contract but no runtime library.

## Functional capabilities

### Operator authorization

The app reads the active Alma operator context. The operator authorization
guard permits the workflow only when the session contains a supported role.
Unauthorized users receive a clear message and cannot invoke account actions.

### User selection and lookup

The app accepts the user entity supplied by Alma or provides search. It
normalizes the selected Alma record and attempts OpenAthens lookup using the
configured identifier, email address, and Alma primary identifier in order.

### Account creation and maintenance

Operators can create an account from eligible Alma identity data, update an
existing account, or resend an activation message. The app shows progress,
success, and actionable failure states and refreshes displayed account data
after successful changes.

### Alma synchronization

The OpenAthens username can be written to a configured primary field and an
optional secondary field. Supported choices are job description, a configured
identifier type, and user note.

### Configuration

Institution-level configuration defines the HTTPS proxy base URL, identifier
type, optional excluded email domain, and username storage fields. Invalid
non-HTTPS proxy values are ignored.

## Quality and security outcomes

- The production Angular build must succeed from the lockfile on Node.js 22.
- Root and bundled manifests must remain identical.
- The public OpenAPI must remain free of a production service hostname.
- Protected calls must carry the Cloud App bearer token and retry once after a
  `401` with a refreshed token.
- Issues and contributions must contain no credentials or personal user data.
- Automated checks must prevent service or operational capabilities from
  returning to the public tree.

## Release model

Frontend and external service releases use coordinated semantic versions when
the interface changes. Interface-compatible frontend corrections may be
released independently after build, contract, and regression checks pass.
