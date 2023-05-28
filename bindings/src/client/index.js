import mp from '../shared/mp.js';
import alt from 'alt-client';

mp.streamingDistance = alt.getSyncedMeta(mp.prefix + 'streamingDistance');

import natives from 'natives';
import '../shared/index.js';
import './statics/Events.js';
import './entities/index.js';
import './natives.js';
import './extraNatives.js';
import './statics/index.js';
import './polyfill.js';

function populateModule(moduleObject) {
    globalThis.module = moduleObject;
    Object.defineProperty(globalThis, 'exports', {
        get: () => {
            return moduleObject.exports;
        },
        set: (value) => {
            moduleObject.exports = value;
        },
        configurable: true
    });
    globalThis.__filepath = moduleObject.__path;
    globalThis.__dirname = moduleObject.__path.replace(/\/[^/]+$/, '');
}

globalThis.require = function (path) {
    path = path.replaceAll('./', '');
    if (!path.startsWith('/')) path = '/' + path;
    if (path.endsWith('/')) path = path.substring(0, path.length - 1);
    if (!alt.File.exists(path)) {
        if (alt.File.exists(path + '.js')) path += '.js';
        else if (alt.File.exists(path + '/index.js')) path += '/index.js';
        else if (alt.File.exists('/node_modules' + path)) path = '/node_modules' + path;
        else if (alt.File.exists('/node_modules' + path + '.js')) path = '/node_modules' + path + '.js';
        else if (alt.File.exists('/node_modules' + path + '/package.json')) {
            let content;
            try {
                content = JSON.parse(alt.File.read('/node_modules' + path + '/package.json'));
            } catch(e) {
                throw new Error(`Failed to import node module ${path.substring(1)}: ${e}`);
            }

            const main = content.main ?? 'index.js';
            if (alt.File.exists('/node_modules' + path + '/' + main)) path = '/node_modules' + path + '/' + main;
            else throw new Error(`Cannot find main file in module ${path.substring(1)}`);
        }
        else throw new Error('Cannot find file ' + path);
    }

    const oldModuleObject = globalThis.module;
    const moduleObject = { exports: {}, __path: path };
    populateModule(moduleObject);
    const content = alt.File.read(path);
    try {
        alt.evalModule(path, content);
    } catch(e) {
        throw new Error(`Failed to require file ${path}:\n${e}`);
    }
    if (oldModuleObject) populateModule(oldModuleObject);
    return moduleObject.exports;
};

populateModule({ exports: {}, __path: '/' });

globalThis.global = globalThis;

globalThis.mp = mp;

const AsyncFunction = (async function () {}).constructor;
// TODO delete after debugging
if (alt.debug && mp._main) {
    alt.on('consoleCommand', async (cmd, ...args) => {
        if (cmd !== 'eval') return;
        console.log(await (new AsyncFunction('alt', 'natives', args.join(' ')))(alt, natives));
    });
}

alt.loadDefaultIpls();

if (mp._main) {
    mp._initEventHandlers();
}
