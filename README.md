# AEON Supertoy Tools (VS Code)

Local VS Code extension scaffold for `.aeon` files.

## Features

- `aeon` language registration for `*.aeon`
- syntax highlighting via TextMate grammar
- AEON validation diagnostics powered by `scripts/aeonlint.sh`
- commands:
  - `AEON: Validate Current File`
  - `AEON: Validate Workspace`
- save-time validation toggle:
  - setting: `aeon.validateOnSave` (default: `true`)

## Validation Modes

- strict mode (`--strict`) is used for:
  - `interactive-toys/personality/production/*.aeon`
- basic mode (`--basic`) is used for all other `.aeon` files.

## Run In Development Host

1. Open this folder in VS Code:
   - `vscode-aeon-supertoy`
2. Press `F5` to launch an Extension Development Host.
3. In the host window, open the main repository and open any `.aeon` file.
4. Run `AEON: Validate Current File` from Command Palette, or save to trigger validation.

## Notes

- This scaffold runs `bash` and expects `scripts/aeonlint.sh` in the repo root.
- It is designed for local/Linux workflows used by this project.
