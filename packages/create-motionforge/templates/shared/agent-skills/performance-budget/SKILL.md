---
name: performance-budget
description: "Optimize agent and runtime cost without losing quality. Use for token budgets, compile caching, rendering memory and expensive effects."
---

# Performance Budget

## Inputs
Representative scenes, target devices and measured baseline.

## Procedure
1. Load only active skill instructions and current API excerpts; prefer patch receipts over full documents.
2. Cache compilation by content/version; use bounded SVG-frame caches and release unused assets.
3. Measure compile time, frame readiness latency, peak memory and output size before/after.
4. Reduce redundant geometry, offscreen work and full-frame filters while inspecting visual equivalence.

## Acceptance gate
Benchmark manifest and measured improvement with no hidden feature loss.

## Avoid
Do not claim optimized or token-efficient from fewer lines alone; no unbounded caches.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
