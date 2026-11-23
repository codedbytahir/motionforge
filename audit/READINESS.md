# Local readiness

## Resolved targets: green
- Root production build, Prisma generation and standalone browser smoke test: pass.
- Real offline canvas capture, video/audio muxing, production UI download and independent decode: pass.

Evidence and reproducible commands: [ROOT-AND-OFFLINE.md](ROOT-AND-OFFLINE.md).

## Overall production signoff: still blocked
Full manual review, dependency/security/license audit and broader browser/capture compatibility remain outstanding. These were not part of the two engineering targets resolved in this pass.

### Latest manual/security/license pass
See `final/REVIEW.md` and `final/PUBLISHING.md`. Manual review and license clearance remain incomplete. Current runtime advisories: zero reported; root all-dependency graph retains one low stale esbuild entry. Targeted fixes and tests pass, but previous release archives predate these edits. Do not publish them as audit-cleared.
