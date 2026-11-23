---
name: visual-regression
description: "Review animation quality and catch regressions. Use for motion changes, generated films, playback or claimed visual fixes."
---

# Visual Regression

## Inputs
Approved baseline, fixture set and tolerance policy.

## Procedure
1. Sample boundaries plus representative transition and held frames; do not rely only on thumbnails.
2. Use fixed environment and seeded inputs; compare deterministic renders with documented tolerances.
3. Watch actual playback and listen to decoded audio; test text at delivery size.
4. Store failures, inspected frames, numeric results and manual observations separately.

## Acceptance gate
Regression report with what ran and what remains untested.

## Avoid
A passing typecheck or metadata test is not visual or playback QA.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
