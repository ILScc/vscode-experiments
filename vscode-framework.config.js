//@ts-check

/** @type{import('vscode-framework/build/config').UserConfig} */
const config = {
    development: {
        disableExtensions: false,
    },
    esbuild: {
        production: {
            defineEnv: {
                EXTENSION_BOOTSTRAP_CONFIG: null,
            },
        },
    },
    // target: 'web',
    // webOpen: 'web',
    target: { desktop: true, web: true },
}

module.exports = config
