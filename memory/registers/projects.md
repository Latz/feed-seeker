# Projects Register

> Load when: a specific project is being discussed or worked on.
> Contains: project state, goals, key decisions, blockers, next steps.

<!-- Add entries per project. Format:
## [Project Name]
- **Status**: active | paused | complete
- **Goal**: ...
- **Current State**: ...
- **Key Decisions**: ...
- **Blockers**: ...
- **Next Steps**: ...
-->

## feed-seeker ^trb8d4e2f0c6
- **Status**: active
- **Goal**: TypeScript RSS/Atom/JSON feed discovery library with CLI
- **Current State** (2026-03-08): All SonarCloud issues addressed across 7 modules (anchors, blindsearch, deepSearch, fetchWithTimeout, checkFeed, eventEmitter, metaLinks); 224 tests passing across 12 test files; `tsc --noEmit` clean
- **Key Decisions**: Lazy-load STANDARD/COMPREHENSIVE endpoint arrays in blindsearch.ts; Vitest as test runner; ES2021 target for `replaceAll()` support; concurrent anchor checking with `Promise.allSettled`
- **Blockers**: S1444 on `eventEmitter.ts` is permanently unresolvable (see decisions.md)
- **Next Steps**: Re-run SonarCloud analysis to verify issue fixes are recognized
