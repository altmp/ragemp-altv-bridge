import * as esbuild from 'esbuild'
import fs from 'fs';
import { dtsPlugin } from 'esbuild-plugin-d.ts'

if (fs.existsSync('dist'))
    fs.rmSync('dist', { recursive: true });
fs.mkdirSync('dist');

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outdir: 'dist',
    external: ['alt-shared', 'alt-client', 'alt-server', 'natives'],
    platform: 'node',
    format: 'esm',
    target: 'es2022',
    splitting: true,
    define: {
        'global': 'globalThis'
    },
    plugins: [dtsPlugin()]
})