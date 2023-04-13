import mp from '../shared/mp.js';
import alt from 'alt-client';
import '../shared/index.js';
import './statics/Events.js';
import './entities/index.js';
import './natives.js';
import './extraNatives.js';
import './statics/index.js'
import './polyfill.js';

globalThis.require = function (path) {
    if (!path.startsWith('/')) path = '/' + path;
    if (path.endsWith('/')) path = path.substring(0, path.length - 1);
    if (!alt.File.exists(path)) {
        if (alt.File.exists(path + '.js')) path += '.js';
        else if (alt.File.exists(path + '/index.js')) path += '/index.js';
        else throw new Error('Cannot find file ' + path);
    }

    const moduleObject = { exports: {} };
    globalThis.module = moduleObject;
    globalThis.exports = moduleObject.exports;
    globalThis.__filepath = path;
    globalThis.__dirname = path.replace(/\/[^/]+$/, '');
    const content = alt.File.read(path);
    [eval][0](content);
    return moduleObject.exports;
}

globalThis.mp = mp;
