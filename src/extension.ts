import * as vscode from "vscode";
import * as path from "path";

export interface Snippet {
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
			let processedSnippet = handleSnippetWithFilename(selectedSnippet);
			sendSnippetToTerminal(selectedSnippet, processedSnippet);
		});
	}));
}

/**
 * 
 * @param snippet the selected snippet
 * Replaces ${filename} part of the snippet with the path of the currently open filename in the editor, if any
 */
export function handleSnippetWithFilename(snippet: Snippet): string {
	if (snippet.template.indexOf("${filename}") !== -1) {
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) { return snippet.template; }
		let openedFilePath = activeEditor.document.fileName;
		// create a workspace-relative file path (can we make this optional per snippet?)
		let currentlyOpenWorkspaceFolders = vscode.workspace.workspaceFolders;
		if (!currentlyOpenWorkspaceFolders) { return snippet.template; }
		let currentlyOpenWorkspaceFolder = currentlyOpenWorkspaceFolders[0];
		let projectRelativeOpenedFilePath = openedFilePath.replace(currentlyOpenWorkspaceFolder.uri.fsPath, "");
		projectRelativeOpenedFilePath = handlePathSeparators(snippet, projectRelativeOpenedFilePath);
		return snippet.template.replace("${filename}", projectRelativeOpenedFilePath);
	}
	return snippet.template;
}

/**
 * 
 * @param snippet the selected snippet
 * @param openedFilePath a half-processed path to the currently open file in the editor
 */
export function handlePathSeparators(snippet: Snippet, openedFilePath: string): string {
	let resPath = openedFilePath;
	if (openedFilePath.startsWith(path.sep)) {
		resPath = openedFilePath.substring(1);
	}
	let pathSeparatorConfig = snippet.pathSep || vscode.workspace.getConfiguration().get("terminalSnippets.defaultPathSep");
	if (pathSeparatorConfig && pathSeparatorConfig !== path.sep) {
		let pathSeparatorMatcher;
		if (path.sep === "\\") {
			pathSeparatorMatcher = path.sep.repeat(2);
		} else {
			pathSeparatorMatcher = path.sep;
		}
		return resPath.replace(new RegExp(pathSeparatorMatcher, "g"), pathSeparatorConfig as string);
	}
	return resPath;
}

export function sendSnippetToTerminal(snippet: Snippet, processedSnippet: string): void {
	let activeTerminal = vscode.window.activeTerminal;
	if (!activeTerminal || snippet.newTerminal) {
		activeTerminal = vscode.window.createTerminal(`Terminal Snippets-${snippet.name}`);
	}
	activeTerminal.show();
	activeTerminal.sendText(processedSnippet);
}

export function deactivate() {}
