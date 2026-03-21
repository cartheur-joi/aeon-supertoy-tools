# Development Notes

Maintainer-only publishing and packaging instructions live here so they do not appear in VS Code Marketplace extension details.

## Publish

```bash
npm i -g @vscode/vsce
vsce login cartheur
vsce package
vsce publish
```

## Packaging Artifact (`.vsix`)

The file `aeon-supertoy-tools-<version>.vsix` is a generated build artifact.
It is intentionally excluded from git and may be removed during repo cleanup.

Recreate it any time from the repo root:

```bash
npx -y @vscode/vsce@2.24.0 package
```
