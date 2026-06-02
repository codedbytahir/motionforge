# CLI Commands

The `@motionforge/cli` package provides tools to render videos and stills from the command line.

## `render`

Render a composition to a video file.

```bash
motionforge render <entry> <compositionId> [options]
```

### Options

| Option | Default | Description |
| :--- | :--- | :--- |
| `-o, --output` | `output.mp4` | Path to save the video. |
| `--codec` | `h264` | Video codec: `h264`, `h265`, `vp8`, `vp9`, `prores`, `gif`. |
| `--fps` | `30` | Frame rate. |
| `--width` | `1920` | Video width. |
| `--height` | `1080` | Video height. |
| `--duration` | `300` | Duration in frames. |
| `--props` | `undefined` | JSON string of input props to inject. |
| `--concurrency` | `4` | Number of concurrent browser pages for rendering. |
| `--frame-range` | `undefined` | Range to render, e.g., `0-29`. |
| `--crf` | `18` | Constant Rate Factor (quality). |

---

## `still`

Render a single frame to an image file.

```bash
motionforge still <entry> <compositionId> [options]
```

### Options

| Option | Default | Description |
| :--- | :--- | :--- |
| `-o, --output` | `output.png` | Path to save the image. |
| `--frame` | `0` | The frame number to render. |
| `--props` | `undefined` | JSON string of input props. |

---

## `compositions`

List all compositions registered in the entry file.

```bash
motionforge compositions <entry>
```

---

## `studio`

Start the MotionForge Studio development environment.

```bash
motionforge studio <entry> [options]
```

### Options

| Option | Default | Description |
| :--- | :--- | :--- |
| `-p, --port` | `3123` | Port to run the studio on. |
