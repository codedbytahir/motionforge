# Compositions

Compositions are the building blocks of MotionForge videos. A composition defines the dimensions, frame rate, duration, and the root component of your video.

## The `<Composition />` Component

Use the `<Composition />` component to register a video.

```tsx
import { Composition } from 'motionforge';
import { MyVideo } from './MyVideo';

export const Root = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "Welcome to MotionForge"
      }}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | A unique identifier for the composition. |
| `component` | `React.ComponentType` | **Required** | The root React component to render. |
| `durationInFrames` | `number` | **Required** | Total number of frames in the video. |
| `fps` | `number` | `30` | Frames per second. |
| `width` | `number` | `1920` | Width of the video in pixels. |
| `height` | `number` | `1080` | Height of the video in pixels. |
| `defaultProps` | `Record<string, any>` | `{}` | Default props passed to the component. |
| `inputProps` | `Record<string, any>` | `{}` | Dynamic props that override defaults. |
| `calculateMetadata` | `Function` | `undefined` | Async function to resolve metadata dynamically. |
| `schema` | `ZodSchema` | `undefined` | Optional Zod schema for prop validation. |

---

## The `<Still />` Component

A convenience component for rendering a single frame (e.g., for thumbnails).

```tsx
import { Still } from 'motionforge';

<Still
  id="Thumbnail"
  component={MyVideo}
  width={1280}
  height={720}
  defaultProps={{ frame: 45 }}
/>
```

Equivalent to a `Composition` with `durationInFrames={1}` and `fps={1}`.
