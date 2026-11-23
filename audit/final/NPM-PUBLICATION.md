# npm publication authorization and method

The user explicitly requested npm publication after GitHub source publication. Unresolved audit findings remain disclosed in REVIEW.md. This authorization does not assert those findings have been resolved.

Repository secret metadata confirms NPM_TOKEN exists; its value was never retrieved. The publish workflow now permits the existing GitHub Actions secret, with OIDC available when configured, and uses an explicit confirmation of publication with known findings rather than falsely confirming all blockers resolved. Package READMEs carry the audit disclosure.

Latest source CI e980337 passed install/build/typecheck/library tests/packed consumer/CLI tests/review regressions/root build, but failed its dependency-scan step. That failure is not suppressed or relabeled as success. Package publication retains build and package-test gates.

The workflow publishes framework1.5.0 first, then CLI1.2.0. Exact-version registry checks and publication results must be verified; this log alone is not evidence of successful publication.

## Verified outcome

Workflow45260246434 succeeded. npm registry independently confirms motionforge1.5.0 and create-motionforge1.2.0. Both registry responses expose provenance attestations. Registry processing temporarily returned404 before propagation completed. CLI executable mapping is present as bin/index.js; initial npm normalization warning did not remove the published executable mapping. Tarball verification details are in npm-publication-result.json.

Install: `npm install motionforge@1.5.0`

Scaffold: `npx create-motionforge@1.2.0 my-video --yes`

Audit gaps remain; publication does not constitute clearance.
