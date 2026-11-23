# Trolic × MotionForge agent integration pack

Start with `references/RESEARCH-V2.md` for the researched architecture and `AGENT-CONTRACT.md` for execution rules. Discover the 16 skills through `skill-catalog.json`; their bodies are in `../.agents/skills/`.

These are local research-branch additions, not an installed production agent runtime. Your agent host must support skill discovery, or explicitly read the catalog and selected SKILL.md files. No upstream skills were copied or installed.

From repository root:
```sh
node agent-integration/scripts/test-frame-time.mjs
python agent-integration/scripts/validate-skills.py
```

Original task-specific skills cover direction, vectors, bridge, timing, storyboards, typography, blur entrances, truthful UI demos, audio, readiness, export, visual QA, safe edits, releases, performance and accessible delivery.

Do not load every full skill body into a single prompt. Do not treat instructions as implemented engine functionality. Browser integration and real muxed export remain separate required work.
