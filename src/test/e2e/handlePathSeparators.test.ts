import { handlePathSeparators, Snippet } from "../../extension";
import * as assert from "assert";
import * as mockRequire from "mock-require";
import * as path from "path";
import * as vscode from "vscode";


suite("handlePathSeparators() tests", function() {
    let originalDefaultPathSep: any;
    setup(async function() {
        // simulate a Windows environment
        mockRequire("path", Object.defineProperty(path, "sep", {value: "\\"}));
        originalDefaultPathSep = vscode.workspace.getConfiguration().get("terminalSnippets.defaultPathSep");
        await vscode.workspace.getConfiguration().update("terminalSnippets.defaultPathSep", undefined, true);
    });

    test("Converts Windows path separator to Posix ones on Windows when required", function() {
        const openedFilePath = "C:\\path\\to\\file.txt";
        const snippet: Snippet = {name: "test", template: "echo ${filename}", pathSep: "/"};
        const res = handlePathSeparators(snippet, openedFilePath);
        assert.equal(res, "C:/path/to/file.txt");
    });

    teardown(async function() {
        await vscode.workspace.getConfiguration().update("terminalSnippets.defaultPathSep", originalDefaultPathSep, true);
    });
});
