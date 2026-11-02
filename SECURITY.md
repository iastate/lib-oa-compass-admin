# Security Policy

## Supported version

Security fixes are applied to the current default branch and the latest
published release.

## Dependency validation

Public CI installs the committed lockfile and rejects critical findings from
the complete npm dependency tree. Release `2.0.1` temporarily overrides the
build-time `tar` dependency to patched version `7.5.21` while the Ex Libris
`2.0.2` SDK remains on its supported Angular 18 line. The override must be
removed when an Ex Libris SDK update supplies a compatible patched dependency.
Other upstream SDK and toolchain findings remain tracked in public issue `#2`.

Candidate `2.0.5` additionally pins compatible transitive fixes for `piscina`
`4.9.4`, `proxy-addr` `2.0.8`, and `shell-quote` `1.11.0`. These address
[GHSA-67c8-pqhq-4rmx](https://github.com/advisories/GHSA-67c8-pqhq-4rmx),
[GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h), and
[GHSA-pqg4-j6r4-53mv](https://github.com/advisories/GHSA-pqg4-j6r4-53mv)
within the SDK's existing major versions. Clean install, the critical-audit
gate, production compilation, and component checks must pass together.
Remove these overrides when the supported SDK supplies equivalent patched
versions. Non-critical findings remain tracked; this is not a clean-audit claim.

The LIBDEV-3281 dependency-review candidate updates the SDK set to 2.1.0,
Lodash to 4.18.1, PostCSS to 8.5.32, UUID to 11.1.1, and compatible transitive
resolutions while retaining Angular 18 and the existing overrides. The dated
[dependency assessment](docs/dependency-review-2026-11-02.md) classifies every
remaining audit entry, records release impact, and provides a vendor-request
draft. It reports zero critical but 20 high findings; no residual-risk exception
or vendor response is implied. Owner review and updated authenticated regression
remain release requirements.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting feature for this repository. If
that feature is unavailable, contact the Iowa State University Library through
its official website and request a private channel with the application
maintainers.

Do not open a public issue containing exploit details, credentials, bearer
tokens, Alma or OpenAthens user data, tenant identifiers, or nonpublic service
information. Include only the minimum reproducible detail in the private
report. Maintainers will acknowledge the report, assess impact, coordinate any
cross-service correction, and publish an advisory when appropriate.

## Public repository boundary

This repository intentionally contains no service implementation, secrets, or
infrastructure automation. The OpenAPI document describes the external
interface without publishing service configuration or credentials.
