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

esbuild.build({
    entryPoints: ['src/client/index.js'],
    bundle: true,
    outdir: 'dist',
    entryNames: 'client',
    format: 'cjs',
    target: 'es2017',
    sourcemap: 'inline',
    plugins: [globalExternals({
        'alt-client': {
            varName: 'alt',
            type: 'cjs'
        },
        'alt-shared': {
            varName: 'alt',
            type: 'cjs'
        },
        'natives': {
            varName: 'native',
            type: 'cjs'
        }
    })]
});
