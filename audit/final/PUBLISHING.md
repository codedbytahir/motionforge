# Publishing MotionForge 1.5.0 and create-motionforge 1.2.0

**Do not publish as audit-cleared yet.** REVIEW.md lists unresolved code, reproducibility and license blockers. These instructions are executable once those are resolved, or for an explicitly disclosed prerelease using a new prerelease version. Nothing in this audit published anything.

## 1. Restore a real Git checkout and commit the reviewed source

This workspace recovery has no .git metadata. Use a fresh checkout of https://github.com/codedbytahir/motionforge, then copy the reviewed source changes into it. Do not overwrite .git, .env files or unrelated changes; do not copy node_modules, .next, credentials or obsolete release artifacts. Review `git diff`, including all three package-lock.json files and workflows. Keep audit evidence and change logs. Commit and push your reviewed release branch to the intended repository.

Do not paste an access token into scripts, URLs, commit history or chat. Use your authenticated Git client/GitHub CLI or the browser. No previously deleted credential should be recovered.

## 2. Validate using the CI toolchain

Use Node24 and npm11.16.0 (version availability verified). Root and package installs are independent; run each.

```sh
npm install --global npm@11.16.0
npm ci --ignore-scripts
npm ci --prefix packages/motionforge --ignore-scripts
npm ci --prefix packages/create-motionforge --ignore-scripts
npm run typecheck --prefix packages/motionforge
npm run build --prefix packages/motionforge
npm test --prefix packages/motionforge
npm run test:package --prefix packages/motionforge
npm test --prefix packages/create-motionforge
node audit/final/test-review.mjs
npm run build
npm audit
npm audit --prefix packages/motionforge
npm audit --prefix packages/create-motionforge
```

Root build generates Prisma through its build script. Offline/browser validation additionally requires Chromium and system libraries; follow audit/ROOT-AND-OFFLINE.md and run agent-integration/scripts/test-offline.mjs, test-production.mjs and the independent decoder against the newly built version. The production browser test expects its documented running server. Resolve failures; do not turn failed audits/tests into `|| true` release gates.

Rebuild packages, inspect `npm pack --dry-run --json` in each package, ensure bundled third-party licenses/source and agent skills are present and no credentials, source maps with secrets or unwanted files leak. Confirm CLI-generated dependency is ^1.5.0 and framework is published first. Local intended versions are 1.5.0 / 1.2.0; registry had 1.4.0 / 1.1.0 at audit time. Recheck exact target versions before release: npm versions cannot be overwritten.

## 3. Recommended: npm trusted publishing with GitHub OIDC

Official requirements: https://docs.npmjs.com/trusted-publishers/ . npm>=11.5.1 and Node>=22.14.0; the workflow uses newer versions. Read current npm UI instructions when configuring.

For **each** npm package, as its owner, open npm package Settings → Trusted publishing and add the GitHub publisher for:

- Organization/user: codedbytahir
- Repository: motionforge
- Workflow filename: publish.yml (not its full path)
- Environment: npm-release
- Explicitly permit direct `npm publish` if the configuration defaults to staged publishing. This workflow does direct publication, not npm stage.

In repository Settings → Environments create `npm-release` and add required reviewers/release-branch restrictions. Protect main, require CI, and ensure publication is from a public source repository for public provenance. Do not configure long-lived NPM_TOKEN for this OIDC workflow. Remove obsolete token secrets once no other authorized automation needs them.

The replacement `.github/workflows/publish.yml` uses npm ci, Node24, pinned npm, package tests, `id-token: write`, provenance, and exact package@version checks. Only E404 is treated as unpublished; network/auth errors fail closed. It publishes framework before CLI. Publication is not transactional: if CLI fails after framework succeeds, correct the CLI issue and rerun; framework's exact version is skipped.

Once REVIEW.md blockers are resolved, GitHub → Actions → Publish npm packages → Run workflow → select reviewed branch → check release-review confirmation → run → approve npm-release environment. The checkbox is a human assertion, not automated proof of clearance. The workflow has NOT been tested on GitHub during this session. Review/pin third-party action commits before release signoff.

## 4. Alternative: local interactive npm publication

If you own both packages, prefer interactive login with 2FA rather than a token stored in this project:

```sh
npm login
npm whoami
(cd packages/motionforge && npm publish --access public)
npm view motionforge@1.5.0 version dist.integrity
(cd packages/create-motionforge && npm publish --access public)
npm view create-motionforge@1.2.0 version dist.integrity
```

Run this from the full validated monorepo checkout: library prepublishOnly runs the monorepo regression scripts. Local publication does not automatically gain GitHub OIDC provenance; do not claim provenance that was not generated. If a target version already exists, skip it or deliberately increment package versions and regenerate locks/changelogs/tests. Never silently substitute a later version.

## 5. GitHub release

After npm verifies successfully, from the reviewed Git commit:

```sh
mkdir -p releases
(cd packages/motionforge && npm pack --pack-destination ../../releases)
(cd packages/create-motionforge && npm pack --pack-destination ../../releases)
sha256sum releases/motionforge-1.5.0.tgz releases/create-motionforge-1.2.0.tgz > releases/SHA256SUMS
```

Create a GitHub release/tag such as v1.5.0 at that exact commit and attach the two fresh tarballs and checksums. Include release notes identifying CLI1.2.0, fixed issues, remaining limitations, offline Canvas/PCM scope, browser requirements, conditional/unvalidated MP4 support, lack of hosted render workers, and relevant third-party licensing/source locations. Use the GitHub-generated source archive or a carefully filtered full-source ZIP, not an older library-only backup. Tagging alone does not run this manual npm workflow.

## 6. Landing page: GitHub Pages

The static landing page is docs/index.html, with local assets under docs/assets. After pushing the reviewed files, repository Settings → Pages → Deploy from branch → main → /docs → Save. If Pages is already managed by Actions, inspect that deployment configuration instead of switching it blindly. Verify the resulting URL and relative video/font/asset paths from a clean browser.

GitHub Pages serves only static content. It cannot run the Next.js Studio/server/API routes, Prisma or hosted rendering. Deploy the root Next.js app separately to a Node-capable host, using the documented standalone production build and explicit production environment configuration. Never upload .env/credentials or expose the development server as the production deployment.

## 7. Verify the actual public artifacts

- `npm view motionforge@1.5.0 dist.integrity` and CLI1.2.0 resolve to the intended releases.
- In a fresh temporary directory run `npx create-motionforge@1.2.0 my-video --yes`, inspect generated files, install, typecheck/build, and confirm it resolves motionforge1.5.0.
- Repeat strict packed/public-package consumers for ESM/CJS/NodeNext/Bundler and optional peer paths.
- Verify npm provenance in its UI if OIDC was used, the release tag commit, license/source inclusion and public landing-page playback.
- Record commands/results and public URLs in the work log. Never claim successful publication based only on a local build.
