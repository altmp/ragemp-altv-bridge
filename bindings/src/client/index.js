import mp from '../shared/mp.js';
import alt from 'alt-client';
import altShared from 'alt-shared';
import {internalName} from '../shared/utils';

mp.streamingDistance = alt.getSyncedMeta(internalName('streamingDistance')) ?? 300;
mp._disableRawEmits = true;
// TODO: pass streaming distance in core

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
    if (path === 'alt-client') return alt;
    if (path === 'alt-shared') return altShared;
    if (path === 'natives') return natives;

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
        const msg = `Failed to require file ${path}:\n${e}\n${e?.stack}`;
        throw new Error(msg);
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
        try {
            if (cmd === 'eval' && mp._enableEval) {
                console.log(await (new AsyncFunction('alt', 'natives', args.join(' ')))(alt, natives));
            } else if (cmd === 'evalAll' && mp._enableEval) {
                alt.emitServer(mp.prefix + 'evalAllPlayers', args.join(' '));
            } else if (cmd === 'evalPlayer' && mp._enableEval) {
                alt.emitServer(mp.prefix + 'evalPlayer', alt.Player.getByRemoteID(+args[0]), args.slice(1).join(' '));
            } else if (cmd === 'profileStart') {
                console.log('Started profiling!');
                alt.Profiler.startProfiling('profile');
            } else if (cmd === 'profileStop') {
                const profile = JSON.stringify(alt.Profiler.stopProfiling('profile'));
                const filename = `profile-${Date.now()}.cpuprofile`;
                const chunkSize = (alt.getSyncedMeta(internalName('eventSize')) ?? 8192) / 2 - 300;
                console.log(`Stopped profiling! Saving as ${filename}. Size: ${(profile.length / 1000 / 1000).toFixed(1)} MB (chunking by ${chunkSize} B)`);

                const chunks = Math.ceil(profile.length / chunkSize);
                for (let chunk = 0; chunk < chunks; chunk++) {
                    const data = profile.substring(chunkSize * chunk, chunkSize * (chunk + 1));
                    // console.log(`Emitting chunk ${chunk}, ${data.length}`);

                    // Handled in resource/main-server.js
                    alt.emitServer('$bridge$profileSave', filename, chunk, chunks, data);
                }
            }
        } catch(e) {
            console.error(e);
        }
    });
}

alt.onServer(mp.prefix + 'eval', async (code) => {
    console.log(await (new AsyncFunction('alt', 'natives', code))(alt, natives));
});

alt.loadDefaultIpls();
natives.networkAllowRemoteSyncedSceneLocalPlayerRequests(1);

if (mp._main) {
    mp._initEventHandlers();
}

alt.on('connectionComplete', () => {
    console.log('Connection complete!');
    mp.events.callRemote('playerReady');
});
