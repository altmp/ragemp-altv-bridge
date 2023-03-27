const esbuild = require('esbuild')

esbuild.build({
    entryPoints: ['src/client/index.js', 'src/server/index.js'],
    bundle: true,
    outdir: 'dist',
    external: ['alt-client', 'alt-server', 'alt-shared', 'natives']
});