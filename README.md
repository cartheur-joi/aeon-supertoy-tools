# AEON Supertoy Tools

VS Code extension for `.aeon` files.

## Features

- Language registration for `*.aeon`
- Syntax highlighting via TextMate grammar
- Optional validation commands:
  - `AEON: Validate Current File`
  - `AEON: Validate Workspace`
- Save-time validation toggle:
  - `aeon.validateOnSave` (default: `true`)

## Validation Integration

Validation is optional and requires an `aeonlint` shell script at:

- `<workspace>/scripts/aeonlint.sh`, or
- `<extension>/scripts/aeonlint.sh`

If no script is found, validation is skipped and syntax highlighting still works.

Validation mode selection:

- `--strict` for paths containing `interactive-toys/personality/production/`
- `--basic` for all other `.aeon` files

## Local Development

1. Open this extension folder in VS Code.
2. Press `F5` to launch an Extension Development Host.
3. Open a project containing `.aeon` files.
4. Run `AEON: Validate Current File` or save a file.

## Publish

```bash
npm i -g @vscode/vsce
vsce login cartheur
vsce package
vsce publish
```
