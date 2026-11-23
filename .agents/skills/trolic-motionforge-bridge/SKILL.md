---
name: trolic-motionforge-bridge
description: "Connect Trolic assets to MotionForge. Use for Lottie adapters, source imports, cache invalidation and editable composition layers."
---

# Trolic Motionforge Bridge

## Inputs
Source version, source FPS, host FPS, sequence offset, rate and delivery profile.

## Procedure
1. Compile outside the frame loop; memoize parsed animationData by source hash and compiler/profile version.
2. Map sequence-local time with the tested frame-time helper; never treat host frames as source frames.
3. Await DOMLoaded and decoded assets; reject failures/timeouts and clean up stale source instances.
4. Preserve source references and diagnostics separately from generated Lottie and video.

## Acceptance gate
30/60 FPS, seek, source replacement, loop and Sequence-offset tests plus explicit readiness.

## Avoid
Do not claim browser compatibility from arithmetic tests alone; src identity changes can reload Lottie.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
