# Root production build and real offline export

## Targeted status: green
Both engineering targets requested in this task are implemented and locally verified. This is not a claim that the remaining full manual review, dependency audit or all-browser certification is complete.

## Root application
- Restored missing root source from public upstream commit d0f2466 while preserving the edited library/scaffold source archive. Exact recovery details: SOURCE-RECOVERY.md.
- Limited npm download concurrency and serialized library declaration builds to avoid exhausting this 2 GB sandbox.
- Repaired partially extracted native SWC and lucide-react files left by interrupted installation. SWC now loads normally; all declared root package entry paths checked during repair.
- Prisma client generation is part of the build/typecheck commands.
- Build runs Next.js 16.4.6 with webpack, one CPU worker, no ignored TypeScript build errors, standalone output and bundled static/public assets.
- Final root build passed. Standalone server passes homepage and offline-export route HTTP 200, browser hydration with no page errors, actual UI export/download and mobile overflow checks.

### Run locally
```sh
# Node 20.20.2 was used here. Install native browser dependencies for the browser tests.
npm ci --ignore-scripts --no-audit --no-fund
npm --prefix packages/motionforge ci --ignore-scripts --no-audit --no-fund
npm --prefix packages/motionforge run build
npm run typecheck
NODE_OPTIONS=--max-old-space-size=1152 npm run build
HOSTNAME=0.0.0.0 PORT=8014 npm start
```
The generated Next output is not checked into the source archive; run the build after restoring a snapshot.

## Offline export
New `exportOfflineVideo` and `mixOfflineAudio` APIs are exported from `motionforge/renderer` and the main library.

- Sequential explicit frame capture into a caller-supplied canvas.
- Awaited readiness callback, per-operation timeout, cancellation and errors.
- WebCodecs encoding, real Mediabunny muxing and explicit timestamps.
- OfflineAudioContext PCM mixing supports cue offsets, trims and gains.
- Default WebM uses VP9 video and Opus audio. MP4 is conditional on browser AVC/AAC encoding; MP4 has not been validated in this runner.
- Production demo route `/offline-export` actually exports/downloads a 60-frame video with a synchronized audio cue.
- Legacy fabricated export facades remain disabled. `/api/render` returns 501 because hosted workers are not implemented.

## Measured proof
Browser test exercises the built distribution, not just source:
- 60 frames requested in order, at 30 FPS, two-second timeline.
- Seek checks confirm dark/light reference frames at the correct times.
- Browser video plays to completion; audio independently decoded through browser AudioContext.
- Five explicit failures verified: capture error, readiness timeout, pre-abort, mismatched audio duration, invalid configuration.

Independent FFmpeg decode:
- 60 video frames decoded.
- 96,648 decoded audio samples at 48 kHz (2.0135 seconds, including Opus padding).
- Audio pulse begins at 1.0000208333 seconds against a 1-second target.
- Production UI's separately downloaded WebM also fully decodes.

## Reproduce tests
```sh
npx playwright install --with-deps chromium
node agent-integration/scripts/test-offline.mjs
node agent-integration/scripts/test-production.mjs  # production server must be running
python agent-integration/scripts/verify-offline.py --ffmpeg /path/to/ffmpeg
npm --prefix packages/motionforge run test:package
```
The packed consumer still passes strict TypeScript 5.9.3 NodeNext/Bundler checks and validates all 14 export targets.

## Licensing / packaging
Pinned Mediabunny 1.41.0 is bundled as a build-time dependency. Its unmodified corresponding source and MPL-2.0 license are included under third-party/mediabunny. This avoids leaking its conflicting legacy global WebCodecs type package into consumers while preserving license/source notices. Original MotionForge code remains MIT. The consumer regression passes without skipLibCheck.

## Deliberate limits
This is verified **canvas + pre-mixed PCM** capture and muxing. It does not automatically capture arbitrary React DOM, wait for every possible WebGL/HTML asset, supply a hosted rendering service, or guarantee codec support across all browsers. Output is currently memory-buffered. See packages/motionforge/OFFLINE-EXPORT.md for dimensions/duration limits and integration details.

No public deployment or npm publication was performed.
