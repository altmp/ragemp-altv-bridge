const esbuild = require('esbuild')

esbuild.build({
    entryPoints: ['src/client/index.js'],
    bundle: true,
    outdir: 'dist',
    entryNames: 'client',
    external: ['alt-client', 'alt-shared', 'natives'],
    format: 'esm',
    target: 'es2017',
    sourcemap: 'inline',
});
