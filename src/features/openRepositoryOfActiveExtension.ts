import { fromUrl } from 'hosted-git-info'
import * as vscode from 'vscode'
import { registerExtensionCommand, showQuickPick } from 'vscode-framework'

export const registerOpenRepositoryOfActiveExtension = async () => {
    registerExtensionCommand('openRepositoryOfActiveExtension', async () => {
        // TODO copy id, link button
        const extensionId = await showQuickPick(
            vscode.extensions.all.map(({ id, packageJSON }) => {
                let label = packageJSON.displayName
                if (!packageJSON.repository) label = `[no repository] ${label}`
                return { value: id, label, description: id }
            }),
            { matchOnDescription: true, title: 'Open Repository of Active Extension' },
        )
        if (extensionId === undefined) return
        let { repository } = vscode.extensions.getExtension(extensionId)!.packageJSON
        if (!repository) return
        let repoDir: string | undefined
        if (typeof repository === 'object') {
            repoDir = repository.directory
            repository = repository.url
        }

        const repo = fromUrl(repository)!
        let urlPath = ''
        if (repo.domain === 'github.com' && repoDir) {
            urlPath = `/tree/master/${repoDir}`
        }

        await vscode.env.openExternal((repo.browse() + urlPath) as any)
    })
}
