__registerExtraBootstrapFile('/server.js');

// Handled here due to no access to fs from bootstrap file
import alt from 'alt-server';
import fs from 'fs';
import path from 'path';

if (alt.debug) {
    const buffers = {};
    alt.onClient('$bridge$profileSave', async (_, filename, chunk, chunks, data) => {
        if (!(filename in buffers)) {
            buffers[filename] = Array(chunks).fill(null);
            console.log(`Started receiving profile ${filename}`);
        }
        buffers[filename][chunk] = data;
        // console.log(`Received profile ${filename} chunk ${chunk + 1}/${chunks}, ${data.length}`);
        if (buffers[filename].every(e => typeof e === 'string')) {
            const str = buffers[filename].join('');
            console.log(`Received all chunks of ${filename}. Size: ${(str.length / 1000).toFixed(1)} MB. Writing to disk!`);
            fs.mkdirSync('profiles', { recursive: true });
            fs.writeFileSync('profiles/' + filename, str);
            alt.emit('profileSaved', path.resolve('profiles/' + filename));
            delete buffers[filename];
        }
    });
}
