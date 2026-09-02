# spring()

The `spring()` function creates physics-based animations that feel natural and organic. Unlike linear interpolation, spring animations have momentum and can overshoot their target.

## Basic Usage

```tsx
import { useCurrentFrame, useVideoConfig, spring } from 'motionforge';

const MyComponent = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: {
      damping: 12,
      stiffness: 100
    }
  });

  return (
    <div style={{ transform: `scale(${scale})` }}>
      Animated Box
    </div>
  );
};
```

## Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `frame` | `number` | **Required** | The current frame. |
| `fps` | `number` | **Required** | Frames per second of the composition. |
| `from` | `number` | `0` | Starting value. |
| `to` | `number` | `1` | Target value. |
| `delay` | `number` | `0` | Frames to wait before starting the animation. |
| `reverse` | `boolean` | `false` | If true, plays the animation from `to` to `from`. |
| `durationInFrames`| `number` | `fps * 2` | Approximate duration until the spring settles. |
| `config` | `Object` | See below | Spring physics configuration. |

### Config Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `stiffness` | `number` | `100` | The spring tension. Higher = faster. |
| `damping` | `number` | `10` | Friction. Lower = more "bouncy" oscillation. |
| `mass` | `number` | `1` | Weight of the object. |
| `overshootClamping`| `boolean`| `false` | If true, prevents the value from going past `to`. |

---

## Reverse Spring (Exit Animations)

Use the `reverse` prop to easily create exit animations using the same spring physics.

```tsx
const opacity = spring({
  frame,
  fps,
  delay: 200, // Wait until frame 200
  reverse: true, // Fade out
});
```
