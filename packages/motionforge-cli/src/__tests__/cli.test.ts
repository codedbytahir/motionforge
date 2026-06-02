import { $ } from 'bun';
import path from 'path';

describe('CLI Integration', () => {
  const cliPath = path.resolve(__dirname, '../../bin/motionforge.js');

  it('should show help', async () => {
    const result = await $`bun ${cliPath} --help`.text();
    expect(result).toContain('Usage: motionforge');
  });

  it('should list compositions', async () => {
    const result = await $`bun ${cliPath} compositions --help`.text();
    expect(result).toContain('List available compositions');
  });
});
