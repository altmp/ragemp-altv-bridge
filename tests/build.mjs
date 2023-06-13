import * as fs from 'fs';
import * as path from 'path';

if (fs.existsSync('dist'))
    fs.rmSync('dist', { recursive: true });
fs.mkdirSync('dist');

fs.cpSync('../testlib/dist', 'dist/testlib', { recursive: true });
fs.copyFileSync('./resource.toml', 'dist/resource.toml');
fs.copyFileSync('./package.json', 'dist/package.json');
for (let file of fs.readdirSync('./src')) {
    const content = fs.readFileSync(path.join('./src', file), 'utf8');
    fs.writeFileSync(path.join('./dist', file), content.replace(/from (['"])testlib\//g, 'from $1./testlib/'));
}