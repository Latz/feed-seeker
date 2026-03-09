# Tech Stack Register

> Load when: technical choices, languages, frameworks, or tooling come up.
> Contains: confirmed tech choices, constraints, version requirements, tool preferences.

<!-- Add entries when technical choices are confirmed. Format:
## [Category]
- **Choice**: ...
- **Version**: ...
- **Rationale**: ...
- **Constraints**: ...
-->

## Test Runner — 2026-03-08 ^tr7c3e9f1d2a
- **Choice**: Vitest (`vitest run`)
- **Rationale**: Replaced Node built-in test runner; better DX, native ESM support, compatible with existing test files
- **Constraints**: `package.json` `"test"` script must remain `"vitest run"`
- **Status**: active
