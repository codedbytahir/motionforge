# Real offline export

## Supported path
`exportOfflineVideo` renders an explicitly supplied canvas one requested frame at a time, awaits the caller's readiness promise, encodes using WebCodecs, and muxes a real container using pinned Mediabunny 1.41.0. It does not record wall-clock playback or microphones.

Default output is WebM (VP9 + optional Opus). MP4 (AVC + optional AAC) is available only when the current browser can encode those codecs; unsupported configurations reject explicitly. Only WebM has been validated in this local runner so far.

```ts
import {exportOfflineVideo, mixOfflineAudio} from 'motionforge/renderer';

const config = {width: 1280, height: 720, fps: 30, durationInFrames: 150};
// Decode audio files with AudioContext.decodeAudioData before this step.
const audio = await mixOfflineAudio([
  {buffer: musicBuffer, at: 0, gain: 0.4},
  {buffer: clickBuffer, at: 2, gain: 0.1}
], config.durationInFrames / config.fps);

const {blob} = await exportOfflineVideo({
  canvas,
  config,
  audio,
  signal: abortController.signal,
  renderFrame: async (frame, seconds) => {
    // Seek your scene; await fonts, image decoding, Lottie DOM or WebGL draw.
    // Then draw/copy the completed frame into canvas before resolving.
    await drawReadyFrame(canvas, frame, seconds);
  },
  onProgress: (completed, total) => console.log(completed / total)
});
// Download blob or persist it using your application's file workflow.
```

`drawReadyFrame` above is application code, not a MotionForge export. The readiness callback is mandatory; no arbitrary React DOM-to-canvas conversion is promised. A React/DOM renderer must supply an actual capture backend. Existing legacy `renderVideo`/hosted routes do not silently route to a pretend export.

## Audio timeline
`mixOfflineAudio` uses OfflineAudioContext to mix decoded PCM clips at explicit seconds, with trim offsets, durations and gain. Export expects the resulting buffer to match video duration within one PCM sample. Opus codec padding may increase decoded duration by a few milliseconds: the proof's decoded audio lasts 2.0135 seconds for a 2-second timeline, while the pulse aligns at 1.0000208 seconds.

## Guarantees and limits
- Sequential frame calls; timestamps `frame/fps` and durations `1/fps`.
- Awaited encoder/muxer backpressure and real output finalization.
- Missing frames/assets, codec errors, cancellation and readiness timeouts reject rather than reporting success.
- 4096px maximum dimensions, 120 FPS maximum, 10-minute duration ceiling; output currently buffered in memory. Use shorter/lower-resolution exports according to device memory. This is not a streaming-to-disk implementation.
- Cancelled exports cannot forcibly stop arbitrary user callback code. Callbacks should honor the same AbortSignal and must not start unbounded background work.
- This is a browser offline API, not a hosted render worker or universal React/WebGL capture engine.

## Executed proof
`node agent-integration/scripts/test-offline.mjs` (repository root): 60-frame two-second canvas export, 30 FPS, VP9/Opus; PCM pulse mixed at 1 second; native video decode/seek/playback and decoded audio alignment; capture error, timeout, abort, mismatched audio duration and invalid config rejection.

Independent FFmpeg decode verifies all 60 video frames and audio; exact measured results in `audit/offline/independent-decode.json`. Browser results and a playable proof are in `audit/offline/`.

## Dependency licensing
MotionForge's own code remains MIT. Mediabunny 1.41.0 is an MPL-2.0 dependency bundled in the distribution; it has not been relicensed or modified here. Its unmodified corresponding source and license are included under third-party/mediabunny. Preserve these notices when distributing it. Review obligations for your distribution; do not claim all transitive code is MIT-only.
