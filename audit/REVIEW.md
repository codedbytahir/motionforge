# MotionForge review — progress report, not full approval

## Verdict
**Do not mark this repository fully audited or production-export ready.** An initial automated inventory covered 142 source/config files and 32,417 lines, with 18 pattern matches to triage. That is a scan, not a manual review of every line. The inventory excludes generated dist, installed dependencies and duplicated bundled skill references; it is not a dependency security audit.

## Manually examined areas
Library Lottie/Trolic integration and lifecycle, frame conversion, render facades/capture/encoding, HyperFrame execution boundary, glitch randomness, CLI input/output behavior, package/export configuration, CI/publication workflows, Next configuration, hosted render endpoint, landing-page source and logo provenance. Earlier passes and test results are in the merger WORKLOG and package PACKAGING-FIX.md.

## Findings and changes
| Severity | Location / evidence | Change and status |
|---|---|---|
| High | `packages/motionforge/src/renderer/index.ts`, former generateFrames/renderVideo placeholder loop and fabricated outputUrl; same in app-local renderer | Replaced placeholder frames with explicit rejection; renderVideo returns unsuccessful result with no fabricated output. Tested against built renderer. |
| High | `src/app/api/render/route.ts`, former simulated startRenderJob | Removed simulated jobs; GET/POST/DELETE now explicitly return 501. Root Next app production build has not been executed. |
| High | `packages/motionforge/src/components/HyperFrame.tsx`, former same-origin unsandboxed srcdoc/direct window execution | Added allow-scripts-only sandbox, restrictive CSP, source-checked postMessage protocol, no-referrer, and removed direct parent access/ts-ignore calls. Browser fixture verifies parent DOM access is blocked and the frame still loads. This is not a complete hostile-code security audit or a server isolation guarantee. |
| Medium | `packages/motionforge/src/components/Effects.tsx:295-296` and app duplicate, prior Math.random in Glitch | Replaced random offsets with deterministic frame-derived noise. Not a complete effect-by-effect visual regression. |
| High process risk | `.github/workflows/publish.yml` formerly every main push | npm publication now manual workflow_dispatch only. Website deploy workflow is separate, avoiding accidental npm publication when updating the site. |
| Medium | `next.config.ts`, prior ignoreBuildErrors:true | Set false. Existing root application type errors may now surface and must not be ignored. Full root build still pending. |
| Packaging | tsup concurrent cleaning and missing stylesheet/declarations | Previous fix retained: single cleanup, explicit clean:false, emitted stylesheet, export-file assertions and strict packed-consumer tests. |

## Tests actually executed in this pass
- Library clean build, TypeScript check and library unit/export tests passed.
- Strict TS5.9.3 packed consumer NodeNext/Bundler tests passed; all 14 export targets present.
- Browser Trolic integration regression passed after security change; sandbox attribute and blocked parent DOM access additionally asserted.
- Legacy built renderer rejects placeholder frames and never reports a fabricated artifact.
- Landing page: desktop primary action above 800px fold, mobile no horizontal overflow, actual video time advances, no page errors.
- Hallmark static lint: 0 FAIL, 0 REFLEX, 0 WARN. Its optional render tier lacked puppeteer-core; independent Playwright checks were used instead. No claim of all Hallmark visual gates mechanically passing.

## Landing page and logo
`docs/` is a static Pages site with local demo, poster, font and license; no fake metrics or testimonials. The actual app mark was extracted from `src/app/page.tsx:81-83` and `src/lib/remotion/icons/index.tsx:695-710` into `docs/assets/motionforge-mark.svg`. The unrelated Z mark found in public/logo.svg was NOT chosen as the final logo. A separate report attachment was not available; this uses the verifiable existing app brand.

Preview runs on port 8012. `.github/workflows/pages.yml` can deploy docs through Actions after Pages is enabled for GitHub Actions. No push/Pages enablement has been performed: fresh GitHub publishing authorization is required; prior temporary credentials were deleted.

## Outstanding before comprehensive signoff
- Manual review of every remaining file/line, with review coverage tracked rather than inferred from scans.
- Complete root Next application installation/build/test and engine duplication elimination.
- Proper offline capture readiness, real muxed video/audio export and broad codec/browser/device checks.
- Hostile HyperFrame navigation/resource-abuse/cancellation tests and clear input trust policy.
- Remaining effects, sequence nesting, media seeking, cache/memory limits and cancellation lifecycle review.
- Dependency vulnerability/license assessment, clean-room CI reproduction and supported runtime matrix.
- Public deployment verification and rollback rehearsal. Updated local candidate was repacked after the fixes.

No public release or deployment should be described as completed by this report.
