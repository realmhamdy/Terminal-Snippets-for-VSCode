import * as vscode from "vscode";
import * as path from "path";

interface Snippet {
	readonly name: string;
	readonly template: string;
	readonly newTerminal?: boolean;
	readonly pathSep?: string;
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand("terminalSnippets.popupSnippetBox", (args): void => {
		let snippets = vscode.workspace.getConfiguration().get("terminalSnippets.snippets");
		let snippetNames = (snippets as [Snippet]).map((snippet) =>  snippet.name);
		vscode.window.showQuickPick(snippetNames, {canPickMany: false, placeHolder: "Enter snippet name:"}).then((selectedSnippetName) => {
			if (selectedSnippetName === undefined) { return; }
			// what if a user configures a snippet name twice or more?
			let selectedSnippet = (snippets as [Snippet]).filter((snippet) => snippet.name === selectedSnippetName)[0];
			let processedSnippet = selectedSnippet.template;
			if (selectedSnippet.template.indexOf("${filename}") !== -1) {
				let activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor) { return; }
				let openedFilePath = activeEditor.document.fileName;
				// create a workspace-relative file path
				let currentlyOpenWorkspaceFolders = vscode.workspace.workspaceFolders;
				if (!currentlyOpenWorkspaceFolders) { return; }
				let currentlyOpenWorkspaceFolder = currentlyOpenWorkspaceFolders[0];
				let projectRelativeOpenedFilePath = openedFilePath.replace(currentlyOpenWorkspaceFolder.uri.fsPath, "");
				if (projectRelativeOpenedFilePath.startsWith(path.sep)) {
					projectRelativeOpenedFilePath = projectRelativeOpenedFilePath.substring(1);
				}
				let pathSeparatorConfig = selectedSnippet.pathSep || vscode.workspace.getConfiguration().get("terminalSnippets.defaultPathSep");
				if (pathSeparatorConfig && pathSeparatorConfig !== path.sep) {
					let pathSeparatorMatcher;
					if (path.sep === "\\") {
						pathSeparatorMatcher = path.sep.repeat(2);
					} else {
						pathSeparatorMatcher = path.sep;
					}
					projectRelativeOpenedFilePath = projectRelativeOpenedFilePath.replace(new RegExp(pathSeparatorMatcher, "g"), pathSeparatorConfig as string);
				}
				processedSnippet = selectedSnippet.template.replace("${filename}", projectRelativeOpenedFilePath);
			}
			let activeTerminal = vscode.window.activeTerminal;
			if (!activeTerminal || selectedSnippet.newTerminal) {
				activeTerminal = vscode.window.createTerminal(`Terminal Snippets-${selectedSnippet.name}`);
			}
			activeTerminal.show();
			activeTerminal.sendText(processedSnippet);
		});
	}));
}

export function deactivate() {}
