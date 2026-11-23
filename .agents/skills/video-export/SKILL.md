---
name: video-export
description: "Implement valid playable video export. Use for WebCodecs, muxing, audio sync, codecs and downloads."
---

# Video Export

## Inputs
Pinned dependencies, browser capabilities, codec/container pair, resolution and FPS.

## Procedure
1. Use a real muxer such as a verified Mediabunny integration; forward codec configuration metadata.
2. Assign explicit timestamps/durations, await source backpressure, bound encoder queues and close frame resources.
3. Mux audio on the same timeline; propagate encoder errors, cancellation and finalize failures.
4. Decode the output independently and check frame count, duration, seekability and audio alignment.

## Acceptance gate
Verified container, full decode, stream metadata and real persisted artifact before job completion.

## Avoid
Concatenated encoded chunks are not a valid WebM guarantee; simulated progress must never mean rendered.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
