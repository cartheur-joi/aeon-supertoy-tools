# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## 0.1.3 - 2026-03-21

- Removed maintainer-only publish/packaging instructions from Marketplace-visible `README.md`.
- Added `DEVELOPMENT.md` for internal release workflow notes.
- Added `.vscodeignore` rules to exclude internal docs and local artifacts from the published package.
- Optimized workspace validation by linting discovered `.aeon` file URIs directly (no document open per file).
- Updated `AEON: Toggle Validate On Save` to write setting at workspace scope when a workspace is open (falls back to global otherwise).

## 0.1.2 - 2026-03-20

- Updated extension icon assets.
- Updated manifest icon path configuration.
- Fixed VSCE packaging configuration.

## 0.1.1 - 2026-03-13

- Added AEON Activity Bar icon and sidebar container.
- Added `AEON Tools` sidebar view with quick actions for validation.
- Added `AEON: Toggle Validate On Save` command.

## 0.1.0 - 2026-03-13

- Initial public release.
- Added AEON language registration and TextMate grammar.
- Added optional validation commands and save-time validation setting.
