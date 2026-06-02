# delayRender / continueRender

MotionForge provides a synchronization protocol to handle async operations like data fetching or asset loading during the rendering process.

## Why Use It?

The renderer needs to know when a frame is "ready" to be captured. If your component fetches data from an API, the renderer might capture the frame before the data arrives, resulting in a blank or incomplete video.

## Usage

Use `delayRender()` to signal an async operation and `continueRender()` when it's done.

```tsx
import { useEffect, useState } from 'react';
import { delayRender, continueRender, AbsoluteFill } from 'motionforge';

export const MyAsyncComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 1. Signal that we're starting an async operation
    const handle = delayRender('Fetching user data');

    fetch('/api/user')
      .then(res => res.json())
      .then(json => {
        setData(json);
        // 2. Signal that the operation is complete
        continueRender(handle);
      })
      .catch(err => {
        console.error(err);
        // 3. Always continue, even on error!
        continueRender(handle);
      });
  }, []);

  if (!data) return null;

  return (
    <AbsoluteFill>
      <h1>Hello, {data.name}!</h1>
    </AbsoluteFill>
  );
};
```

### Important Rules

1. **Always call `continueRender`**: If you forget, the renderer will wait until the safety timeout (30 seconds) before failing.
2. **Multiple calls**: You can call `delayRender` multiple times. The renderer will wait until **all** handles have been cleared via `continueRender`.
3. **Outside of React**: These functions are standalone and can be used in utility functions or outside of components.
