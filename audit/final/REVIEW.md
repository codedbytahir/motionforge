# MotionForge audit and release status

Date: 2026-11-12. **Release signoff: BLOCKED. This is an interim audit, not a completed full manual review or legal clearance.** Nothing was publicly published.

## Completed work and evidence

- Scanned the root, framework and CLI lockfiles, including development and runtime-only graphs. Initial raw scans: `*-audit-all.json`, `*-audit-runtime.json`.
- Root initially had 9 vulnerable nodes: 5 high, 3 moderate, 1 low. Library had 1 low development node; CLI 0.
- Removed unused react-syntax-highlighter; updated sharp to 0.35.5; overrides effect 3.22.1, deepmerge-ts 8.0.0, esbuild 0.28.2. These are compatibility overrides, not merely advisory suppressions. Build/test success is evidence, not proof of every Prisma path working.
- Current `root-audit-after.json`: 1 low esbuild development entry, under `packages/motionforge/node_modules/esbuild` in the root lockfile. The installed library esbuild and separate library lockfile use 0.28.2. Root lock still records 0.27.7; reconcile clean-install reproducibility before release. Do not hand-edit registry integrity fields.
- Current root runtime-only scan: 0; library all/runtime: 0; CLI initial all/runtime: 0. Zero means no advisories reported by this registry scan, not guaranteed security.
- Added per-file SHA256 source inventory in `manual-coverage.json`. Statuses deliberately distinguish full reads from files not fully manually reviewed. This does NOT certify the 152-file scope as reviewed.
- Dependency declarations/integrities/available notice-file hashes: `dependency-license-inventory.json`. It includes optional platforms and duplicate nodes across separate graphs, not unique shipped components. Inventory generation is reproducible via `inventory.py`.

## Confirmed fixes

| Finding | Change | Evidence |
|---|---|---|
| Sequence/Loop/Freeze/Reverse/Retiming local frames did not reach standard useCurrentFrame | Relative provider now overrides the shared FrameContext while preserving parent config and controls | SSR regression: parent frame25 + Sequence from20 yields5 |
| FrameCache eviction could hang on empty-string oldest key; oversize entries exceeded budget; replacement evicted unrelated entries | Undefined-key check, size validation/budget refusal, remove replaced entry before eviction | cache regression with empty key, overbudget value and invalid constructor |
| ImageData global caused Node ReferenceError when estimating ordinary strings | Guard browser global existence | Node cache regression |
| useMemoizedFrame global cache collided across hook instances and JSON-serialized cyclic deps | Instance-local React useMemo; no shared serialization key | Typecheck/build/tests; dedicated cyclic/cross-hook mounting test still needed |
| range zero/negative steps could hang; allocations unbounded | Positive finite step, finite bounds, 1M-entry cap | Zero-step regression; additional floating-point boundary test needed |
| Interpolate extend-right selected first segment | Start selection at final segment; reject invalid/non-increasing numeric ranges | Nonlinear multisegment extrapolation and duplicate-input regressions |
| One-frame progress divided by zero | Guard duration<=1 in progress/timeline hooks | Typecheck/build; hook-mount regression outstanding |
| Performance hook returned fabricated measured FPS | Return zero placeholders with explicit measured:false | Typecheck/build |
| CLI target check/create race | Atomic mkdir rather than ensureDir | Scaffold tests including no-overwrite |

Changes applied to both library and root-local mirrors where relevant. `measureSpring` also rejects invalid finite/positive configuration. These are targeted fixes, not a rewrite of legacy timing/media systems.

## Tests executed after edits

All final listed commands exited 0:

- Library typecheck, serial build, existing test suite and strict packed-consumer test.
- `node audit/final/test-review.mjs`: interpolation, range, SSR relative frame and Node cache regressions. First attempts failed due to wrong output suffix and two React installations; harness now uses the library's own ReactDOM resolver and passes. Logs retained.
- CLI scaffold tests: both templates, skills, dependency alignment, name/template rejection, no overwrite, no-skills. Initial attempt failed because CLI dependencies were not installed; npm ci then test passed.
- Root production build, including Prisma generation, after dependency overrides.
- Actual offline-export test after library changes: exit0. Existing independent ffmpeg proof remains in `audit/offline`; independent decode was not rerun in this pass.
- New CI/publish workflows written for Node24/npm11.16.0 and npm ci. Workflow execution/OIDC publication was NOT performed here.

## Outstanding manual/code blockers

1. Finish every first-party file in manual-coverage.json. UI, root media integrations, Trolic/Lottie portions, renderer internals, Player, templates and tests have NOT all been read in full in this pass. Partial/truncated output never counts as a full review.
2. Legacy FrameProvider/PlayerProvider timing increments per RAF / loses elapsed-time precision. CompositionManager mutates its Map without a guaranteed state update. Need reproductions, fixes and tests.
3. Media.tsx accepts endAt/pauseOnFrame but does not implement their intended behavior; audio seeks without playback coordination. Video/Audio spread props after internal onLoadedData, allowing callers to bypass readiness state. Media callback readiness does not imply offline export readiness.
4. Animation utilities: overdamped spring coefficients and measureSpring settling criterion need numerical tests; color interpolation drops alpha/has inadequate parsing/bounds behavior; cubic-bezier derivative needs verification. useCycle negative frame and useLoop zero-duration validation need work.
5. Nondeterministic Glitch implementation recovered from upstream requires follow-up. Do not assert deterministic rendering for every component.
6. Complete cross-hook and lifecycle tests, exact clean installs and full root browser regression after this pass. Root production build passed, but previously running server was not restarted against the new standalone output.
7. Resolve stale root esbuild lock entry. All overriding dependency combinations should be validated in a fresh Node24 environment matching CI.
8. CI uses action version tags rather than immutable commit SHAs; review/pin these before supply-chain signoff. Full browser/offline validation is not yet wired into CI.

## License audit: inventory complete, clearance incomplete

Original code is MIT, but dependencies/assets are NOT all MIT. Snapshot counts include MIT, Apache-2.0, ISC, BSD, MPL-2.0, LGPL-3.0-or-later, CC-BY-4.0, Python-2.0, CC0 and combined expressions. 54 entries lack a lockfile license declaration in the initial inventory. Missing metadata is not evidence of no license or a forbidden license.

- Bundled Mediabunny1.41.0 is MPL-2.0; corresponding source/license are included under framework third-party. Preserve MPL notices and source availability for covered code/modifications; MIT metadata does not relicense this code.
- Sharp native distributions include libvips and LGPL components. Shipping a root Docker image/standalone binary/native libraries requires retaining notices and satisfying applicable LGPL corresponding-source/relinking/replacement obligations. A server-only deployment and distributing an image are different distribution cases. Native vendor license bundles require inspection before redistribution signoff.
- caniuse-lite declares CC-BY-4.0. Preserve attribution and license/change notices when distributing applicable database material.
- Apache dependencies require license/NOTICE preservation where applicable. MIT/ISC/BSD require retaining their copyright/license notices in redistributed covered material, including bundled output as applicable.
- Epilogue font is accompanied by its OFL text in docs/assets. Keep the font license when distributing the font; inspect reserved-name conditions before modifying/renaming it.
- Registry samples in license-registry-samples.json show MIT for sampled esbuild/rollup native packages and fsevents, but these are NOT exact-version clearance of every optional platform. webgl-constants has no license field even in the sampled registry result; inspect its exact tarball/upstream grant. Its grant is unresolved here.
- Inventory currently records available notice paths and hashes, not a consolidated distribution notice bundle or every optional binary's license text. That bundle and exact-artifact review remain release blockers, especially for root images and bundled SDK dependencies.

This is engineering risk analysis, not legal advice. Do not describe the project or release as having completed license clearance.

## Publication and artifacts

See PUBLISHING.md. Existing releases/*.tgz, source ZIP and SHA256SUMS predate this audit unless explicitly regenerated after the edits. Do not publish old artifacts assuming they contain these fixes. Rebuild/pack in the reviewed release commit. No GitHub credentials remain and no credentials were recovered.
