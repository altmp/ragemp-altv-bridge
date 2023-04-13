const esbuild = require('esbuild')
const { globalExternals } = require('@fal-works/esbuild-plugin-global-externals');

esbuild.build({
    entryPoints: ['src/server/index.js'],
    bundle: true,
    outdir: 'dist',
    entryNames: 'server',
    format: 'cjs',
    target: 'es2017',
    sourcemap: 'inline',
    plugins: [globalExternals({
        'alt-server': {
            varName: 'alt',
            type: 'cjs'
        },
        'alt-shared': {
            varName: 'alt',
            type: 'cjs'
        }
    })]
});
