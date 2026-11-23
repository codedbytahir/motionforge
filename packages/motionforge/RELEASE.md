# MotionForge 1.5.0 + create-motionforge 1.2.0

Local release candidates; not published to npm or GitHub.

## motionforge 1.5.0
- New optional `motionforge/trolic` entry: `Trolic`, `Lottie`, `mapSourceFrame` and types. Inject the real Trolic `compileForProfile` function; the compiler is not copied or bundled.
- Memoized source compilation and stable animation data; explicit delivery profile default `lottie-web-svg`.
- Lottie converts composition FPS to source FPS. **Behavior change:** old mixed-FPS compositions may need playbackRate adjustment; the old implementation treated source/host frames as interchangeable.
- Browser-safe lazy lottie-web initialization; load timeout, async data failures, source cleanup, readiness/error callbacks, source-swap generation handling.
- All declared package export targets now emitted, including icons, player, renderer and CSS. Client component entry points retain an explicit client directive.
- Capture failures reject instead of silently painting a background.
- Unfinished raw-chunk WebCodecs encoder now fails explicitly. Export manager uses best-effort MediaRecorder instead of producing a potentially invalid WebM. The new exportOfflineVideo API provides a separate real canvas + PCM offline path; see OFFLINE-EXPORT.md. The legacy raw-chunk path remains disabled.

## create-motionforge 1.2.0
- Updated template dependency on motionforge ^1.5.0 and aligned cinematic peer dependencies.
- Both templates get 16 agent skills, catalog, shared contract and research references. Root AGENTS.md points agents to progressive-disclosure routing.
- `--yes` for noninteractive defaults; `--no-skills` to opt out.
- Validate project/template names and refuse existing target directories; removed destructive overwrite behavior.
- Generated typecheck script and client page boundaries; no-Tailwind projects strip Tailwind directives.
- Node >=20.19 required by the current scaffold dependency set.

## Usage
```tsx
'use client';
import {Trolic} from 'motionforge/trolic';
// Import compileForProfile from your actual installed Trolic checkout/package.
// Keep the function identity stable (module-level import, not a new callback per frame).
export function VectorLayer({source,compileForProfile}) {
 return <Trolic source={source} compiler={compileForProfile}
   onReady={()=>console.log('vector loaded and frame synchronized')}
   onError={error=>console.error(error)} />;
}
```
Use inside a MotionForge FrameProvider/Composition with a frame context. The source compiler must return `{output: string}` containing valid Lottie. Compile failures propagate to the application's React error boundary. `onReady` is an asset-load callback; it is not a universal per-frame capture barrier.

```sh
node path/to/create-motionforge/bin/index.js my-film --yes --template blank
# Add --no-skills or --no-tailwind when desired.
```
A freshly generated project depends on motionforge ^1.5.0. Until publication, replace that dependency with the provided local motionforge-1.5.0.tgz tarball before installation.

## Validation performed
- Library clean build and strict TypeScript check.
- 14 export target existence checks + 12 library timing checks.
- Both CLI templates, skills inclusion/opt-out, dependency alignment, noninteractive defaults, no overwrite and invalid name/template rejection.
- Actual browser fixture with the real local Trolic compiler and lottie-web: Sequence mount/unmount, 60→30 FPS geometry, A-B-A seeking, compile caching, source replacement readiness and no page errors.
- Clean tarball consumer installs and imports: main, trolic, player, renderer and icons.
- Generated blank project dependency installation and TypeScript check.

## Outstanding
The root application now builds and runs in production mode. Real WebM VP9/Opus offline canvas capture/muxing and PCM audio mixing are tested, including independent decoding and audio alignment. General DOM/WebGL capture adapters, a shared readiness registry, reverse-rate playback and broad device/codec testing remain outstanding. Hosted export returns 501 rather than simulating jobs. The old backup archive is library-scoped; full recovered source is now preserved in the new root-production-and-offline-source.zip archive.

## Packaging research credit
Missing subpath declaration/stylesheet report credited to UCSB PLSE (https://ucsbplse.github.io/). See PACKAGING-FIX.md for the clean-once fix and strict packed-consumer regression.
