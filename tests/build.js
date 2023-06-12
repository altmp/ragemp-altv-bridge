const esbuild = require('esbuild');
const fs = require('fs');

if (fs.existsSync('dist'))
    fs.rmSync('dist', { recursive: true });
fs.mkdirSync('dist');

esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    format: 'esm',
    target: 'es2022',
    external: ['alt-shared', 'alt-client', 'alt-server', 'natives'],
    sourcemap: 'inline',
    splitting: true,
});
