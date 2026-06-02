/**
 * Input Props — Dynamic prop injection for MotionForge compositions.
 *
 * Input props are injected at render time (via CLI --props flag or API)
 * and override defaultProps. This enables parametrized video rendering
 * (e.g., rendering 100 personalized videos with different names).
 */

/**
 * Get the input props injected at render time.
 * In the browser, these are set via window.__MOTIONFORGE_INPUT_PROPS
 * before the composition renders.
 *
 * In server-side rendering, the Puppeteer page injects these via
 * page.evaluate() before navigating to each frame.
 */
export function getInputProps(): Record<string, unknown> {
  if (typeof window !== 'undefined' && (window as any).__MOTIONFORGE_INPUT_PROPS) {
    return (window as any).__MOTIONFORGE_INPUT_PROPS;
  }
  return {};
}

/**
 * Serialize input props for injection into the page.
 * Handles special types like Date, undefined, etc.
 */
export function serializeInputProps(props: Record<string, unknown>): string {
  const transform = (val: any): any => {
    if (val instanceof Date) {
      return { __mf_type: 'Date', value: val.toISOString() };
    }
    if (val === undefined) {
      return { __mf_type: 'undefined' };
    }
    if (Array.isArray(val)) {
      return val.map(transform);
    }
    if (val && typeof val === 'object') {
      const obj: any = {};
      for (const key in val) {
        obj[key] = transform(val[key]);
      }
      return obj;
    }
    return val;
  };

  return JSON.stringify(transform(props));
}

/**
 * Deserialize input props that were injected into the page.
 * Restores special types from their serialized form.
 */
export function deserializeInputProps(serialized: string): Record<string, unknown> {
  const parsed = JSON.parse(serialized);

  const restore = (val: any): any => {
    if (val && typeof val === 'object') {
      if (val.__mf_type === 'Date') {
        return new Date(val.value);
      }
      if (val.__mf_type === 'undefined') {
        return undefined;
      }
      if (Array.isArray(val)) {
        return val.map(restore);
      }
      const restoredObj: any = {};
      for (const key in val) {
        restoredObj[key] = restore(val[key]);
      }
      return restoredObj;
    }
    return val;
  };

  return restore(parsed);
}

/**
 * Merge defaultProps with inputProps.
 * inputProps take precedence over defaultProps.
 * Nested objects are shallow-merged (not deep-merged).
 */
export function resolveProps(
  defaultProps: Record<string, unknown>,
  inputProps: Record<string, unknown>
): Record<string, unknown> {
  return { ...defaultProps, ...inputProps };
}
