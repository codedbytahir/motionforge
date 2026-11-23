# Missing subpath declarations and stylesheet — fixed in local 1.5.0 candidate

Reported by the UCSB Programming Languages and Software Engineering research team: https://ucsbplse.github.io/

## Root cause
Concurrent tsup configs shared dist. Per-config cleaning could delete declaration files emitted by a sibling declaration build. The stylesheet was exported but never emitted.

## Fix
- The build removes dist once, before starting tsup.
- Every tsup config explicitly sets clean:false, so declaration jobs cannot clean sibling output.
- Postbuild emits dist/styles.css (an intentionally minimal stylesheet because components use inline styles).
- Postbuild recursively verifies all package.json export targets exist; missing output fails the build.
- `prepack` builds from source. `prepublishOnly` additionally runs library and packed-consumer regression tests.
- CI uses the package build script instead of invoking tsup directly, then runs the packed-consumer tests.

## Regression test
`npm run test:package` creates an npm tarball, verifies all 14 declared export-condition targets in its file list, installs it in a temporary consumer, and compiles the reported PlayIcon/renderVideo imports with strict NodeNext and Bundler resolution using TypeScript 5.9.3. It also checks the player declaration and resolves/reads the installed CSS target.

The test supplies ES2020 + DOM standard libraries for the browser-oriented API. It does not use skipLibCheck or suppress TS7016. Node tested locally: 20.20.2; the research team's Node 26 and TypeScript 7 matrix has not been run here.

## CSS repro clarification
With the emitted file, `import.meta.resolve('motionforge/styles.css')` resolves to an existing stylesheet. Bare Node does not ordinarily execute CSS modules: `import 'motionforge/styles.css'` can report ERR_UNKNOWN_FILE_EXTENSION even when the package is correct. CSS should be imported through a CSS-aware bundler. The regression check verifies resolution and file existence, not native Node CSS execution.

## Result
Clean build passed, 14 built-output checks passed, and two consecutive packed-consumer test runs passed. The existing npm 1.4.0 tarball cannot be amended in place; the corrected 1.5.0 candidate must be published as a new version. No publication was performed in this task.
