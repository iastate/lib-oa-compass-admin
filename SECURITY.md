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
