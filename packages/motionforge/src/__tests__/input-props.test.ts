import { serializeInputProps, deserializeInputProps, resolveProps } from '../core/input-props';

describe('inputProps utilities', () => {
  it('should serialize and deserialize special types', () => {
    const props = {
      date: new Date('2024-01-01T00:00:00.000Z'),
      und: undefined,
      num: 123
    };
    const serialized = serializeInputProps(props);
    const deserialized = deserializeInputProps(serialized);

    expect(deserialized.date).toBeInstanceOf(Date);
    expect((deserialized.date as Date).toISOString()).toBe(props.date.toISOString());
    expect(deserialized.und).toBeUndefined();
    expect(deserialized.num).toBe(123);
  });

  it('should resolve props with precedence', () => {
    const defaultProps = { a: 1, b: 2 };
    const inputProps = { b: 3, c: 4 };
    const resolved = resolveProps(defaultProps, inputProps);
    expect(resolved).toEqual({ a: 1, b: 3, c: 4 });
  });
});
