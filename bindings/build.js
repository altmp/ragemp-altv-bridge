const esbuild = require('esbuild')

esbuild.build({
    entryPoints: ['src/client/index.js', 'src/server/index.js'],
    bundle: true,
    outdir: 'dist',
    entryNames: '[dir]',
    external: ['alt-client', 'alt-server', 'alt-shared', 'natives'],
    format: 'esm',
    target: 'es2017',
    sourcemap: 'inline',
});