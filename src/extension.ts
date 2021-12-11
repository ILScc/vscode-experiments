import vscode from 'vscode'
import { extensionCtx, registerActiveDevelopmentCommand, registerExtensionCommand, registerNoop } from 'vscode-framework'
import { preserveCamelCase } from './features/preserveCamelCase'
import { registerAlwaysTab } from './features/specialTab'
import { registerTsCodeactions } from './features/tsCodeactions'
import { registerRegexCodeActions } from './features/regexCodeactions'
import { registerAddVscodeImport } from './features/addVscodeImport'
import { registerAddImport } from './features/addImport'
import { registerFixedSurroundIf } from './features/fixedSurroundIf'
import { registerRemoveUnusedImports } from './features/removeUnusedImports'
import { registerPickProblemsBySource } from './features/problemsBySource'
import { registerAutoAlignImport } from './features/alignImport'
import { registerStatusBarProblems } from './features/statusbarProblems'
import { registerNextLetterSwapCase } from './features/nextLetterSwapCase'
import { registerFixCss } from './features/fixCss'
import { registerInsertAutoCompletions } from './features/insertAutoCompletions'
import { registerCopyVariableName } from './features/copyVariableName'
import { registerSignatureCompletions } from './features/signatureCompletions'

export const activate = () => {
    // preserve camelcase identifiers (only vars for now)
    preserveCamelCase()
    registerTsCodeactions()
    registerRegexCodeActions()
    registerAlwaysTab()
    registerAddVscodeImport()
    registerAddImport()
    registerFixedSurroundIf()
    registerRemoveUnusedImports()
    registerPickProblemsBySource()
    registerAutoAlignImport()
    registerStatusBarProblems()
    // registerOnTypeFormatter()
    registerNextLetterSwapCase()
    registerFixCss()
    registerInsertAutoCompletions()
    registerCopyVariableName()
    registerSignatureCompletions()

    // vscode.languages.registerSelectionRangeProvider('*', {
    //     provideSelectionRanges(document, positions, token) {

    //     }
    // })

    // vscode.languages.registerDocumentSemanticTokensProvider('typescript', {

    // }, {})

    registerExtensionCommand('openUrl', async (_, url: string) => {
        // to test: https://regex101.com/?regex=.%2B%3A.%2B%3B?&flags=gi
        await vscode.env.openExternal(url as any)
    })

    registerExtensionCommand('goToNextErrorInFile', async (_, url: string) => {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor || activeEditor.viewColumn === undefined) return
        const diagnostics = vscode.languages.getDiagnostics(activeEditor.document.uri)
        const errors = diagnostics.filter(({ severity }) => severity === vscode.DiagnosticSeverity.Error)
        let nextRange = errors[0]?.range
        for (const { range } of errors) {
            if (!range.start.isAfter(activeEditor.selection.end)) continue
            nextRange = range
            break
        }

        if (!nextRange) return
        activeEditor.selections = [new vscode.Selection(nextRange.start, nextRange.end)]
        activeEditor.revealRange(activeEditor.selection)
        await vscode.commands.executeCommand('editor.action.marker.next')
    })

    registerNoop('Better Rename', () => {
        const decoration = vscode.window.createTextEditorDecorationType({
            dark: {
                before: {
                    contentIconPath: extensionCtx.asAbsolutePath('resources/editDark.svg'),
                },
            },
            light: {
                before: {
                    contentIconPath: extensionCtx.asAbsolutePath('resources/edit.svg'),
                },
            },
            // rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        })
        if (!vscode.window.activeTextEditor) throw new Error('no activeTextEditor')
        const pos = vscode.window.activeTextEditor.selection.active
        vscode.window.activeTextEditor.setDecorations(decoration, [
            {
                range: new vscode.Range(pos, pos.translate(0, 1)),
            },
        ])
    })

    registerNoop('React-aware rename', async () => {
        const editor = vscode.window.activeTextEditor
        if (editor === undefined) return
        const { document } = editor
        const pos = editor.selection.end
        const definitions: vscode.LocationLink[] = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', document.uri, pos)
        const definition = definitions[0]
        if (!definition || definition.targetUri !== document.uri) return
        const { targetRange } = definition
        console.log(targetRange.start.line === targetRange.end.line)
        const isUseStatePattern = /\s*const \[(.+), set\1] = /i.exec(document.lineAt(targetRange.end).text)
        if (!isUseStatePattern) return
        const wordRange = document.getWordRangeAtPosition(pos)
        if (!wordRange) return
        const wordAtCursor = document.getText(wordRange)
    })
}
