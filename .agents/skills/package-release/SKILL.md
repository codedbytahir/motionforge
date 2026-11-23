---
name: package-release
description: "Prepare reproducible integration releases. Use for package exports, peer dependencies, versioning and production publishing."
---

# Package Release

## Inputs
Release scope, supported runtime versions, tests and explicit publishing authority.

## Procedure
1. Build from a clean checkout; npm pack and install in a clean consumer before announcing compatibility.
2. Verify every declared export target including types/styles; separate core/react/webgl dependencies.
3. Run fixtures and include limitations, licenses and migration/rollback notes.
4. Publish only approved changes; confirm actual deployed page and artifact hash after push.

## Acceptance gate
Clean consumer import tests, release manifest, deployment checks and preserved previous release.

## Avoid
Checked-in dist artifacts are not proof of an npm tarball; no automatic publishing from skill activation.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
