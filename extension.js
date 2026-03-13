const vscode = require("vscode");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const DIAGNOSTIC_OWNER = "aeonlint";
let missingLintScriptWarned = false;

function isAeonDocument(doc) {
  return doc && doc.languageId === "aeon" && doc.uri && doc.uri.scheme === "file";
}

function getWorkspaceFolderForFile(filePath) {
  const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
  if (folder && folder.uri && folder.uri.fsPath) {
    return folder.uri.fsPath;
  }
  const first = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
  return first && first.uri ? first.uri.fsPath : null;
}

function lintModeForPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return normalized.includes("/interactive-toys/personality/production/") ? "--strict" : "--basic";
}

function parseAeoLintErrors(output, targetFile) {
  const diagnostics = [];
  const lines = output.split(/\r?\n/);
  const normalizedTarget = path.resolve(targetFile);

  for (const line of lines) {
    const match = line.match(/^ERROR:\s*(.+?):\s*(.+)$/);
    if (!match) {
      continue;
    }

    const message = match[1].trim();
    const errorPath = path.resolve(match[2].trim());
    if (errorPath !== normalizedTarget) {
      continue;
    }

    const range = new vscode.Range(0, 0, 0, 1);
    diagnostics.push(
      new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
    );
  }

  return diagnostics;
}

function findLintScript(workspaceRoot, extensionRoot) {
  const candidatePaths = [
    path.join(workspaceRoot, "scripts", "aeonlint.sh"),
    path.join(extensionRoot, "scripts", "aeonlint.sh")
  ];

  for (const scriptPath of candidatePaths) {
    if (fs.existsSync(scriptPath)) {
      return scriptPath;
    }
  }

  return null;
}

function runAeoLint(workspaceRoot, extensionRoot, modeFlag, targetPath) {
  return new Promise((resolve) => {
    const scriptPath = findLintScript(workspaceRoot, extensionRoot);
    if (!scriptPath) {
      resolve({
        exitCode: 0,
        skipped: true,
        output: "AEON validation skipped: scripts/aeonlint.sh was not found in the workspace or extension."
      });
      return;
    }

    const child = cp.spawn("bash", [scriptPath, modeFlag, targetPath], {
      cwd: workspaceRoot,
      shell: false
    });

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.on("close", (code) => {
      resolve({ exitCode: code || 0, output });
    });
    child.on("error", (err) => {
      resolve({ exitCode: 2, output: `ERROR: failed to run aeonlint: ${err.message}` });
    });
  });
}

async function validateOneFile(document, diagnosticsCollection, extensionRoot, showMessageOnSuccess = false) {
  if (!isAeonDocument(document)) {
    return;
  }

  const targetPath = document.uri.fsPath;
  const workspaceRoot = getWorkspaceFolderForFile(targetPath);
  if (!workspaceRoot) {
    vscode.window.showWarningMessage("AEON: no workspace root found for validation.");
    return;
  }

  const modeFlag = lintModeForPath(targetPath);
  const result = await runAeoLint(workspaceRoot, extensionRoot, modeFlag, targetPath);

  if (result.skipped) {
    diagnosticsCollection.delete(document.uri);
    if (!missingLintScriptWarned) {
      missingLintScriptWarned = true;
      vscode.window.showWarningMessage(result.output);
    }
    return;
  }

  if (result.exitCode === 0) {
    diagnosticsCollection.delete(document.uri);
    if (showMessageOnSuccess) {
      vscode.window.showInformationMessage("AEON: file validation passed.");
    }
    return;
  }

  const diagnostics = parseAeoLintErrors(result.output, targetPath);
  if (diagnostics.length === 0) {
    diagnostics.push(
      new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        result.output.trim() || "AEON validation failed.",
        vscode.DiagnosticSeverity.Error
      )
    );
  }

  diagnosticsCollection.set(document.uri, diagnostics);
  if (showMessageOnSuccess) {
    vscode.window.showErrorMessage("AEON: file validation failed. See Problems panel.");
  }
}

async function validateWorkspace(diagnosticsCollection, extensionRoot) {
  const files = await vscode.workspace.findFiles(
    "**/*.aeon",
    "**/{.git,bin,obj,node_modules}/**"
  );
  let checked = 0;
  let failed = 0;

  for (const uri of files) {
    const doc = await vscode.workspace.openTextDocument(uri);
    if (!isAeonDocument(doc)) {
      continue;
    }
    checked += 1;
    await validateOneFile(doc, diagnosticsCollection, extensionRoot, false);
    const after = diagnosticsCollection.get(uri);
    if (after && after.length > 0) {
      failed += 1;
    }
  }

  if (failed > 0) {
    vscode.window.showWarningMessage(`AEON: workspace validation finished. ${failed}/${checked} file(s) reported issues.`);
  } else {
    vscode.window.showInformationMessage(`AEON: workspace validation passed for ${checked} file(s).`);
  }
}

function activate(context) {
  const diagnosticsCollection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_OWNER);
  const extensionRoot = context.extensionPath;
  context.subscriptions.push(diagnosticsCollection);

  context.subscriptions.push(
    vscode.commands.registerCommand("aeon.validateCurrentFile", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !isAeonDocument(editor.document)) {
        vscode.window.showInformationMessage("AEON: open an .aeon file to validate.");
        return;
      }
      await validateOneFile(editor.document, diagnosticsCollection, extensionRoot, true);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aeon.validateWorkspace", async () => {
      await validateWorkspace(diagnosticsCollection, extensionRoot);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const enabled = vscode.workspace.getConfiguration().get("aeon.validateOnSave", true);
      if (!enabled || !isAeonDocument(document)) {
        return;
      }
      await validateOneFile(document, diagnosticsCollection, extensionRoot, false);
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
