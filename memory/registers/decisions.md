# Decisions Register

> Load when: past choices are being questioned, revisited, or built upon.
> Contains: architectural and workflow decisions with rationale and outcomes.

<!-- Add entries when decisions are made. Format:
## [Decision Title] — [Date]
- **Decision**: ...
- **Rationale**: ...
- **Alternatives Considered**: ...
- **Outcome**: ...
- **Status**: active | superseded | reversed
-->

## querySelectorAll generic over NodeListOf cast — 2026-03-08 ^tr5f1a8e3c9d
- **Decision**: Use `querySelectorAll<HTMLLinkElement>(selector)` instead of `querySelectorAll(selector) as NodeListOf<HTMLLinkElement>`
- **Rationale**: Type-safe — satisfies both TypeScript strict mode and SonarCloud S4325 (unnecessary assertion); the generic form carries type info without a cast
- **Alternatives Considered**: Post-hoc `as` cast (causes S4325), plain removal (causes TS2345)
- **Outcome**: Applied in `modules/metaLinks.ts` and `modules/anchors.ts`
- **Status**: active

## eventEmitter S1444 (#defaultMaxListeners) is permanently unresolvable — 2026-03-08 ^tr2e7b0d4f1c
- **Decision**: Do NOT add `readonly` to `static #defaultMaxListeners` in `modules/eventEmitter.ts`
- **Rationale**: TypeScript TS2540 — the field is mutated by `setDefaultMaxListeners()`; adding `readonly` would break the public API
- **Alternatives Considered**: Adding `readonly` (compile error), suppressing with `// @ts-ignore` (not acceptable)
- **Outcome**: S1444 left unresolved; documented as a known, permanent SonarCloud finding
- **Status**: active

## Concurrent anchor checking with Promise.allSettled — 2026-03-08 ^tr4a9f2c1e8b
- **Decision**: Replace serial `for...of` loops in `modules/anchors.ts` (Phase 1: anchor tags, Phase 2: plain-text URLs) with batched `Promise.allSettled` pattern
- **Rationale**: Performance improvement — parallel requests instead of sequential; consistent with concurrency pattern used elsewhere in codebase
- **Alternatives Considered**: Serial for...of loops (original implementation)
- **Outcome**: All 8 tests pass; concurrency default `instance.options?.concurrency ?? 3`
- **Status**: active
