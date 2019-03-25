import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "command-this-file" is now active!');

	let commands = vscode.workspace.getConfiguration().get("commandThisFile.commands");
	
}

// this method is called when your extension is deactivated
export function deactivate() {}
