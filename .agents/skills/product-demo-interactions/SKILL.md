---
name: product-demo-interactions
description: "Stage truthful cursor and UI interactions. Use for buttons, compiler demos, screen recordings and interaction timing."
---

# Product Demo Interactions

## Inputs
Actual UI geometry, target action and expected resulting state.

## Procedure
1. Calculate cursor arrival at the actual button rectangle; hold briefly before press.
2. Show press and release states, followed by visible action confirmation before transition.
3. Place any quiet click sound at the actual press frame; verify with a slow preview.
4. Compare screenshots before press, during press and after confirmation.

## Acceptance gate
Interaction timeline and three verified frames, with no transition hiding the result.

## Avoid
A moving pointer alone is not a click; do not fake unavailable product features.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
