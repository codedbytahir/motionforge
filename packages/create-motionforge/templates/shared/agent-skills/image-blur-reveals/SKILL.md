---
name: image-blur-reveals
description: "Animate image and text entrances with subtle blur. Use for Gaussian blur-to-sharp reveals, image appearances and visual polish."
---

# Image Blur Reveals

## Inputs
Entrance start/duration, source resolution, host output and reduced-motion behavior.

## Procedure
1. Apply a small bounded CSS/SVG blur to the intended visual layer, not blindly to the entire UI.
2. For a restrained starting point use 2-3 output pixels over about 0.2-0.35 seconds, then set exactly zero; tune by visual review.
3. Predecode images, allow blur padding and keep moving cursor/product controls sharp where needed.
4. Inspect start, midpoint, settled frame and compressed playback; disable or simplify in reduced-motion preview.

## Acceptance gate
No clipping/halo; settled frame sharp; timing follows local entrance rather than scene start only.

## Avoid
Blur is a film effect, not a new Trolic grammar feature. Avoid permanent blur and unbounded full-frame filters.

## Shared references
Read `../../../agent-integration/AGENT-CONTRACT.md` relative to this skill directory, then only the task-relevant references listed there. Run shared scripts from the repository root.
