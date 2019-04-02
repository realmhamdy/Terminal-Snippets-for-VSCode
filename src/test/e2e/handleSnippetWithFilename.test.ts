import { handleSnippetWithFilename, Snippet } from "../../extension";
import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";


suite("handleSnippetWithFilename() tests", function() {
    test("converts the path of opened filename to relative form if the snippet requires that", async function() {
        const snippet: Snippet = {name: "test", template: "echo ${filename}", fileForm: "r"};
        // create a workspace from this folder and open this file in it
        let workspaceUri = vscode.Uri.file(__dirname);
        await vscode.commands.executeCommand("vscode.openFolder", workspaceUri);
        await vscode.workspace.openTextDocument(__filename);

        const result = handleSnippetWithFilename(snippet);

        assert.equal(result, `echo ${path.basename(__filename)}`);
    });
});
