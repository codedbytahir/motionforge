---
name: frame-timing
description: "Design deterministic sequencing and retiming. Use for duration edits, reverse seeking, loops, playback drift and frame-rate conversion."
---

# Frame Timing

## Inputs
Host FPS, asset FPS, source frame count, offsets and desired playback rate.

## Procedure
1. Use explicit integer host-frame intervals [start,end); derive all visual state from requested frame.
2. Keep fractional asset-frame positions until renderer sampling; clamp nonloops and define negative-time behavior.
3. Use rational FPS where appropriate, e.g. 30000/1001; do not substitute rounded decimal frame rates in manifests.
4. Run the helper test suite and inspect boundary frames before and after each edit.

## Acceptance gate
Boundary tests, duration/frame count and A-B-A seek repeatability.

## Avoid
No Date.now, unseeded randomness or wall-clock animation as the offline render clock.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
