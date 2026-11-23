# Better integration + agent skills — research v2

## Executive decision
Keep two product cores, add a narrow versioned bridge, and unify the authoring experience above them. A codebase merger now would couple Trolic's portable compiler to MotionForge's React/3D dependencies and unresolved export paths. Build and measure the bridge before considering a monorepo.

### Recommended dependency direction
`brief → agent skills → composition manifest → Trolic compiler + MotionForge composition → readiness-aware frame capture → encoder/muxer → verified artifact`

Never make Trolic core import MotionForge. Never turn film-only blur, HTML text, audio or shaders into implicit Trolic/Lottie language features.

## External research
1. **Agent Skills specification:** required name/description YAML frontmatter, directory-based SKILL.md format and progressive disclosure. Use a small metadata catalog and activate only relevant instructions instead of a giant prompt. Our 16 skills are original task-specific instructions, not copied upstream skills. [1](https://agentskills.io/specification)
2. **Agent host integration:** skill discovery and activation require host support. Shipping files alone does not guarantee a client will load them; expose catalog location in agent instructions and test each supported client. [2](https://agentskills.io/client-implementation/adding-skills-support)
3. **Remotion's official skills repository:** separates creation, markup, render, captions, multimedia, licensing and other workflows. Adopt the separation-of-concerns pattern, not its package-specific API instructions; MotionForge is a different engine. Do not run upstream installers or assume a third-party skill is safe or API-compatible. [3](https://github.com/remotion-dev/skills)
4. **Mediabunny output architecture:** Output owns a container; media sources feed tracks; output targets permit buffering or streaming. Its guide calls for precise fractional frame rates and warns about incompatible track/format combinations. This is a better candidate for a browser export spike than concatenating raw encoded chunks. Pin and test the actual version before implementing. [4](https://mediabunny.dev/guide/writing-media-files)
5. **Muxer migration guidance:** demonstrates passing encoded packets AND encoder metadata to track sources, awaiting add/finalize operations. Preserve those semantics in a bounded async export pipeline rather than dropping metadata. [5](https://github.com/Vanilagy/mp4-muxer/blob/main/MIGRATION-GUIDE.md)

These sources inform the proposal; none proves MotionForge integration already works.

## Architecture options
| Approach | Benefit | Cost/risk | Decision |
|---|---|---|---|
| Compile Trolic to Lottie and use current MotionForge Lottie | Smallest compatibility surface; existing SVG player | Correct FPS, stable data identity, lifecycle/readiness required | First browser proof |
| Sample Trolic SVG at explicit time | Direct deterministic reference; independent of Lottie runtime | DOM/image readiness and per-frame sampling cost | Reference backend and selected simple scenes |
| New shared canvas/scene renderer | Potential unified GPU/performance path | Large geometry, effects and parity burden | Defer until benchmarks justify |
| Full repository/core merger | Single source tree | Dependency coupling and compounded release risk | Not now |

## Proposed packages (names are placeholders)
- `trolic-core`: existing framework-neutral compiler stays stable.
- `trolic-motionforge`: optional React adapter plus frame mapping; compiler caching and structured diagnostics.
- `motionforge-renderer`: real capture/encode/mux worker contract independent of demo app.
- `motionforge-webgl`: optional 3D dependency surface, not required for simple vector clips.
- `motion-agent-skills`: versioned catalog/instructions/scripts; no credentials or runtime privileges.

No new npm names have been reserved, packages published or runtime modules merged.

## Composition contract — start narrow
Version a plain-data manifest containing canvas dimensions; rational host FPS; duration in host frames; asset hashes/provenance; shot intervals; vector source references and compile profile; local source trim/rate/loop; host-only effects; audio cue times; caption references; tool versions; and render budgets.

Keep it a composition contract, NOT a competing vector IR. Reject unknown fields in the first implementation. Derive seconds from host frames. Require stable IDs for patches and compare-and-swap revision checks. Share manifests across preview/export but do not equate preview success with verified output.

## Readiness contract — central missing capability
Proposed adapter lifecycle: prepare(source revision) → ready(asset handles) → seek(frame) → await frameReady(revision, frame) → capture → release. Abort on old revision or timeout. Include fonts, image decode, Lottie DOM completion and WebGL draw acknowledgements. Avoid using fixed sleeps as readiness. An asset failure must reject the render; no silent black frame.

## Frame semantics implemented as a small proof
`agent-integration/scripts/frame-time.mjs` handles host/source FPS, source trim start, host Sequence offset, positive rate, clamped playback and forward looping. It keeps fractional source frames and excludes the upper endpoint. It deliberately rejects reverse playback; reverse needs a separately specified contract.

The helper uses source-start as a trim offset in Lottie-frame units; before the Sequence start it returns visible=false. It is not yet connected to MotionForge's component. Unit tests cover mixed FPS, fractional FPS, loop boundaries, repeatable seeking and invalid inputs. Browser lifecycle remains untested.

## Agent quality system: more capabilities, less prompt bloat
16 focused skills are in `.agents/skills/`. Each has inputs, procedure, acceptance gate and failure patterns. Shared safety and evidence rules live in `AGENT-CONTRACT.md`. Use only selected skill bodies per task.

Suggested routing:
- “Make a launch film”: director → storyboard → authoring/typography/interactions → readiness → visual QA → export.
- “Make rich illustrations”: vector authoring → performance budget → visual regression; no audio/export unless needed.
- “Add soft entrances”: image-blur-reveals + typography + visual regression; do not rewrite the compiler.
- “Publish”: package-release, only after user authorization and tested deployment.
- “Optimize agent tokens”: safe editing + performance budget; measure source/patch/context tokens with the actual agent tokenizer, not character counts alone.

## Evaluate skills, not merely their existence
Create a held-out task set and compare the same agent/model/tool budget with and without selected skills. Suggested initial suite: mixed-FPS asset; nested Sequence; interrupted source load; typography overflow; image decode failure; subtle blur settling; truthful click; compact vector edit; encoder error; invalid container; missing package export; deployment rollback.

Score: task correctness, source validity, pixel/semantic parity, human readability, actual decode/playback, time-to-pass, tokens used, peak memory, safety violations and unsupported claims. Repeat tasks across seeds/runs before claiming improvement. Structural skill checks do not establish creative quality or token savings.

## Prioritized build order
1. Add discoverable skills/catalog and executable narrow tests — done locally in this branch.
2. Wire bridge and readiness in a browser fixture, validate 30/60 and fractional host FPS, source swapping and Sequence seeking — not done.
3. Fix actual muxing/capture error handling; remove simulated export success and add real artifact jobs — not done.
4. Run clean package consumer tests and evaluate the skills on held-out briefs — not done.
5. Only then integrate Studio import/edit UX and consider repository consolidation.

## Scope status
Local research branch only: `research/trolic-agent-skills`. No additional public push, dependency install, upstream skill installation, complete library build or production runtime merger. Existing public film remains unchanged by this research. Earlier source-level findings are retained in `INITIAL-ASSESSMENT.md`.
