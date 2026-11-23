# Trolic × MotionForge: integration assessment

## Recommendation
**Integrate the products through a small adapter; do not combine their core codebases.**

Trolic should remain the compact, agent-authored vector language/compiler. MotionForge should provide React composition, typography, image effects, sequencing, media and video orchestration. A user should be able to place an editable `.trolic` illustration inside a MotionForge composition, then surround it with frame-driven text and media.

A clear product story: **“Describe vectors with Trolic. Direct the film with MotionForge.”** Keep both existing repositories and versioned releases intact. Start an optional `@trolic/motionforge`-style package (proposed name only; availability not checked).

## Inspected versions
- Trolic v1 compiler/API, local publication checkout; landing-film publication commit `6086d74`.
- MotionForge `codedbytahir/motionforge` commit `d0f24662dc5de7f44f914ff18fe34ea901eee6b8`.
- MotionForge root application manifest 0.2.0, library package 1.4.0, scaffold CLI 1.1.0; README calls the cinematic suite v2.0. Clarify this version story before a combined launch.
- MotionForge root and package carry MIT license text. Retain notices when reusing code; this inspection is not a complete transitive-dependency license audit.

## What genuinely fits
| Layer | Existing implementation | Integration value |
|---|---|---|
| Compact authoring | Trolic `api.js`, `compiler.js`, `delivery.js` | Validate agent-authored source; compile once to Lottie or sample SVG at an explicit time |
| Frame clock | MotionForge `packages/motionforge/src/core/context.tsx` | `useCurrentFrame`, `useVideoConfig`, frame/sequence control |
| Vector playback | MotionForge `src/components/Lottie.tsx` within the library | Existing lottie-web SVG rendering with autoplay disabled and frame seeking |
| Film composition | MotionForge `Sequence.tsx`, `Media.tsx`, cinematic animations | Position vector assets alongside text, images, masks and transitions |
| Editable workflow | Trolic Studio models + MotionForge Player | Source and vector-property editing alongside film timing, without flattening source |
| Publishing | Trolic profiles + a repaired MotionForge renderer | Ship vector files separately from flattened video; never imply both preserve the same editability |

## Smallest useful bridge
1. Compile source **outside the per-frame render loop**, keyed by source, compiler version, delivery profile and budgets.
2. Produce stable parsed `animationData` once; MotionForge's Lottie effect reloads on `src` identity changes, so passing a fresh object each render would reload the animation.
3. Use `lottie-web-svg` delivery validation and report unsupported features/errors before rendering.
4. Initially wrap MotionForge's existing `Lottie`. Convert host frames to source frames using:

   `sourceFrame = localCompositionFrame × sourceFPS / compositionFPS × speed`

   Current Lottie implementation uses `currentFrame × playbackRate` directly. For a 60fps Trolic asset in a 30fps film, pass an effective playback rate of 2 at normal speed. The Node probe confirms this arithmetic, not visual browser integration.
5. Define crop/end semantics, negative-frame behavior and loop endpoints explicitly. Keep local Sequence time, not the full-film clock, as the input.
6. For a more deterministic, DOM-independent path, evaluate Trolic SVG at `seconds = localFrame / compositionFPS`. Cache bounded frame results; do not generate every frame of an entire film into memory by default.
7. Add readiness/error barriers before capturing a frame: fonts loaded, images decoded, SVG/Lottie DOM ready, WebGL render completed.

## Source-confirmed risks to fix first

### P0 — export cannot yet be treated as production proof
- `packages/motionforge/src/renderer/export.ts`, `WebCodecsEncoder.stop()`: concatenates encoded VP9 chunks into a Blob named WebM; the source itself notes that a proper muxer is absent. An elementary stream labeled WebM is not a valid container guarantee. Add real muxing, decoder verification, duration/timestamp checks, and backpressure/error propagation.
- Same file: DOM capture uses SVG foreignObject serialization. On capture failure it paints a background instead of rejecting the render. A completed export can therefore conceal missing content. Make this an explicit failure by default, with per-frame diagnostics.
- Same file: capture timing includes setTimeout waits; MediaRecorder uses a live capture stream. Neither is proof that every requested frame, audio sample or CSS/WebGL effect is reproduced exactly.
- `src/app/api/render/route.ts`, `startRenderJob()`: explicitly simulates frame processing with delays, then marks the job complete and assigns a download URL. This route is not a real server export pipeline. Replace it with a render worker and persisted real artifact verification before advertising hosted export.

### P1 — packaging and playback
- `probe-results.json` finds eight declared export-condition paths absent from the checked-in dist tree, covering icons/player/renderer/styles. The tsup config does include several build entries, so test a **fresh build + npm pack + clean consumer install** before deciding which are release defects. A CSS entry needs an actual emitted file or removal.
- `Lottie.tsx`: source frame rate is not automatically normalized to the composition FPS. Add explicit cross-FPS tests before integration.
- Lottie load state is not visibly reset in the src-change initialization, and the error handling shown covers synchronous initialization rather than a complete async failure/timeout lifecycle. Audit source swaps, cancellation, stale events and Strict Mode remounts.
- `core/context.tsx`: playback advances one frame per qualifying requestAnimationFrame and resets lastTime to currentTime. Under stalls it can drift behind real time. Decide preview catch-up policy separately from offline render seeking.
- Root CI installs/builds but does not demonstrate a comprehensive visual/export regression suite. `verify-animations.spec.ts` exists; its presence is not evidence it runs in CI.

### P2 — architecture and compatibility
- There are both app-local `src/lib/remotion/` and packaged `packages/motionforge/src/` implementations. Choose a single authoritative engine and consume it from the app; prevent divergence with tests.
- Core library peer dependencies include Three.js, React Three Fiber, Drei and Framer Motion. Keep a Trolic bridge lightweight and make 3D optional via separate entry points; validate React 18/19 compatibility against the actual dependency versions.
- Do not add all of MotionForge's effect syntax to Trolic. Blur, HTML typography, shaders, audio and 3D are host film effects, not automatically portable Trolic/Lottie features.
- Do not execute arbitrary agent-authored JavaScript in a hosted render worker. Apply resource quotas, network policy, asset allowlists and process/browser isolation. Trolic source also needs configured budgets.

## What to build together
1. **AI motion cards:** compact `.trolic` artwork + MotionForge text/image layout; branded 5–15 second social clips.
2. **Editable product films:** real Studio screenshots, source-to-vector reveals, crisp typography, restrained blur entrances, and controlled audio.
3. **Reusable brand kits:** Trolic palette/source variants combined with MotionForge templates and validated dimensions/durations.
4. **Agent pipeline:** prompt → Trolic source → validation/report → deterministic preview frames → approved composition → verified video. Keep source, manifest and render checks with every artifact.

## Phased plan and acceptance gates
**Phase 1 — bridge proof (smallest scope)**
- Independent adapter prototype; no Trolic core changes, no main-branch merger.
- Existing circle + rich flower assets; 30/60fps host/source combinations; Sequence offsets, reverse seeking, source replacement, loop boundaries.
- Compare the same requested timestamps against Trolic's reference SVG output; semantic/pixel tolerance documented.
- Browser load/error/cleanup tests and per-frame readiness. Pass before advertising compatibility.

**Phase 2 — reliable export**
- Real container muxing, audio mux and sync, deterministic frame capture, bounded queues, cancel and retry.
- CI renders a short fixture, decodes it, checks duration/frame count/audio alignment, and rejects black fallback frames.
- Run one representative typography + blur + vector fixture and one optional WebGL fixture; document unsupported capture paths.

**Phase 3 — shared authoring**
- Import `.trolic` in MotionForge and open it in the vector editor; preserve source provenance and feature warnings.
- Version the composition manifest and adapter contract; keep video-only effects outside the vector source.
- Fresh package consumer test, benchmark memory/compile/frame times, update docs and examples.

## Evidence and limits
Executed: `node probe.mjs` — five compiler/timing checks passed. Saved exact results and sample Lottie. MotionForge dependency installation, full build, browser playback integration, render export and performance benchmarks were **not executed** in this assessment. No full merge was performed. Estimates should follow the bridge/export prototype rather than promising an untested production schedule.

See `WORKLOG.md` for exact actions, publication status and credential hygiene.
