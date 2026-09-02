# interpolate()

The `interpolate()` function maps an input value (usually the current frame) from one range to another. It's the most common way to create animations in MotionForge.

## Basic Usage

```tsx
import { useCurrentFrame, interpolate } from 'motionforge';

const MyComponent = () => {
  const frame = useCurrentFrame();

  // Animate opacity from 0 to 1 over frames 0 to 30
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return <div style={{ opacity }}>Hello World</div>;
};
```

## Advanced Options

```tsx
const value = interpolate(frame, [0, 30, 60], [0, 100, 50], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'wrap',
  easing: Easing.easeOutCubic,
  posterize: 10
});
```

### Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `input` | `number` | The value to interpolate (usually `frame`). |
| `inputRange` | `number[]` | Array of input values. Must be increasing. |
| `outputRange` | `number[]` | Array of output values. Must be same length as `inputRange`. |
| `options` | `Object` | Optional configuration. |

### Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `extrapolateLeft` | `string` | `'clamp'` | How to handle values below `inputRange[0]`. Options: `'clamp'`, `'extend'`, `'identity'`, `'wrap'`. |
| `extrapolateRight` | `string` | `'clamp'` | How to handle values above the last `inputRange` element. Options: `'clamp'`, `'extend'`, `'identity'`, `'wrap'`. |
| `easing` | `Easing \| Easing[]` | `undefined` | Easing function(s) to apply. Can be an array for per-segment easing. |
| `posterize` | `number` | `undefined` | If set, the input will be quantized to steps of this size (stepped animation). |

---

## Extrapolation Modes

- **`clamp`**: (Default) Clamps the result to the output range.
- **`extend`**: Continues the linear interpolation beyond the range.
- **`identity`**: Returns the input value if it's outside the range.
- **`wrap`**: (New) Cycles the value back into the range (looping animation).
