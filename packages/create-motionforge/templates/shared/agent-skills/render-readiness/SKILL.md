---
name: render-readiness
description: "Make capture deterministic. Use for offline frame capture, assets, fonts, asynchronous loading and silent black-frame failures."
---

# Render Readiness

## Inputs
Requested frame, composition revision and all external dependencies.

## Procedure
1. Expose a per-frame readiness barrier covering fonts, images, Lottie DOM and optional WebGL draw completion.
2. Seek explicit frame, await readiness, capture, and attach revision/frame identity.
3. Fail closed on missing assets/timeouts; preserve diagnostic screenshot and error instead of replacing content with black.
4. Bound concurrent work and memory; invalidate old work on cancellation or source replacement.

## Acceptance gate
A-B-A frame checks and deliberate missing-asset tests that fail visibly.

## Avoid
A timeout delay is not proof of readiness. A fallback background is not a successful render.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
