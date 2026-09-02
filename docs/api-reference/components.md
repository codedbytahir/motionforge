# API Reference: Components

## `<AbsoluteFill />`

A container that fills the entire canvas area. It defaults to `position: absolute` and covers the whole parent.

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | `undefined` | Tailwind CSS classes. |
| `style` | `CSSProperties`| `{}` | Inline styles. |
| `children` | `ReactNode` | `undefined` | Children to render. |

> **Tailwind Compatibility**: MotionForge automatically detects if you use layout-related Tailwind classes (like `w-1/2`, `inset-0`, `grid`) and omits conflicting default inline styles.

---

## `<Sequence />`

Used to manage timing and layering. It only renders its children during the specified frame range.

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `from` | `number` | **Required** | Start frame (inclusive). |
| `durationInFrames` | `number` | `Infinity` | How many frames to render for. |
| `premountFor` | `number` | `0` | Render children `N` frames before `from` (invisible) for preloading. |
| `layout` | `string` | `'absolute-fill'` | Layout mode: `'absolute-fill'` or `'none'`. |
| `name` | `string` | `undefined` | Debug label. |

---

## `<Series />`

Plays a list of sequences one after another.

### Usage

```tsx
<Series>
  <Series.Sequence durationInFrames={30}>
    <FirstScene />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60} offset={-5}>
    <SecondScene /> {/* Overlaps first scene by 5 frames */}
  </Series.Sequence>
</Series>
```

### `<Series.Sequence />` Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `durationInFrames` | `number` | **Required** | Duration of this segment. |
| `offset` | `number` | `0` | Gap (positive) or overlap (negative) with previous segment. |

---

## `<Freeze />`

Freezes a single frame for a specific duration.

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `frame` | `number` | **Required** | The frame index to freeze at. |
| `durationInFrames` | `number` | `undefined` | If set, freezes for this many frames then resumes. |
| `active` | `boolean \| Fn` | `true` | Conditional freeze toggle. |
