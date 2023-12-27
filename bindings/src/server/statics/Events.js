import * as alt from 'alt-server';
import mp from '../../shared/mp.js';
import {argsToAlt, argsToMp, emit, internalName, toAlt, toMp} from '../../shared/utils.js';
import { Deferred } from '../../shared/Deferred';
import {BaseEvents} from '../../shared/BaseEvents';
import { InternalChat } from 'shared/DefaultChat.js';
import {emitClientRaw} from 'alt-server';
import {emitClientInternal} from '../serverUtils';

let procHandlers = {};
let cmdHandlers = {};
let globalHandlers = {};
let ignoreLocal = false;

class _Events extends BaseEvents {

    constructor() {
        super();

        alt.onClient((event, player, ...args) => {
            this.dispatchGlobal(event, player, ...argsToMp(args));
        });
        alt.on((event, ...args) => {
            if (ignoreLocal) return;
            if (event.startsWith(mp.prefix)) return;
            if (event === 'playerSpawn' || event === 'playerDeath') return;
            this.dispatchLocal(event, ...argsToMp(args));
        });
        alt.onClient(internalName('repl'), (player, id, res) => {
            if (!player.__pendingRpc || !(id in player.__pendingRpc)) return;
            player.__pendingRpc[id].resolve(toMp(res));
            delete player.__pendingRpc[id];
        });
        alt.onClient(internalName('replError'), (player, id, res) => {
            if (!player.__pendingRpc || !(id in player.__pendingRpc)) return;
            player.__pendingRpc[id].reject(toMp(res));
            delete player.__pendingRpc[id];
        });
        alt.onClient(internalName('call'), (player, event, id, ...args) => {
            this.dispatchRemoteProc(player, event, id, ...args);
        });
        alt.on(internalName('cmd'), (cmd, player, all, ...args) => {
            if (!(cmd in cmdHandlers)) return;
            cmdHandlers[cmd](player.mp, all, ...args);
        });

        alt.on('baseObjectCreate', (obj) => {
            if (obj.mp) this.dispatchLocal('entityCreated', obj.mp);
        });
        alt.on('baseObjectRemove', (obj) => {
            if (obj.mp) this.dispatchLocal('entityDestroyed', obj.mp);
        });

        alt.on('resourceStop', async () => {
            await mp.events.dispatchLocal('serverShutdown');
        });

        alt.on('serverStarted', () => {
            mp.events.dispatchLocal('packagesLoaded');
        });
    }

    on(key, fn){
        super.add(key, fn);

        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key))
                this.add(innerKey, innerValue);
            return;
        }
        if (mp.debug) alt.log('Registering', key);
        if (!(key in globalHandlers)) {
            if (mp.debug) alt.log('Registering2', key);
            globalHandlers[key] = new Set;
        }
        globalHandlers[key].add(fn);
    }

    dispatchGlobal(event, ...args) {
        super.dispatch(event, ...args);

        if (!(event in globalHandlers)) return;
        argsToMp(args);
        for (const handler of globalHandlers[event]) handler(...args);
    }

    /** @internal */
    async dispatchRemoteProc(altPlayer, event, id, ...args) {
        const handler = procHandlers[event];
        if (!handler) return emitClientInternal(altPlayer, 'replError', id, 'RPC not found');
        try {
            const result = await handler(toMp(altPlayer), ...argsToMp(args));
            emitClientInternal(altPlayer, 'repl', id, toAlt(result));
        } catch(e) {
            emitClientInternal(altPlayer, 'replError', id, toAlt(e));
        }
    }

    /** @internal */
    callRemoteProc(player, event, ...args) {
        if (!('__lastRpcId' in player)) player.__lastRpcId = 0;
        const id = player.__lastRpcId++;
        const deferred = new Deferred();
        if (!player.__pendingRpc) player.__pendingRpc = {};
        player.__pendingRpc[id] = deferred;
        emitClientInternal(player, 'call', event, id, ...argsToAlt(args));
        setTimeout(() => {
            deferred.reject(new Error('Timed-out'));
            delete player.__pendingRpc[id];
        }, 30000);
        return deferred.promise;
    }

    call(event, ...args) {
        mp.events.dispatchLocal(event, ...args);
        if (mp._enableInterResourceEvents) {
            try {
                ignoreLocal = true;
                emit(event, ...argsToAlt(args));
            } finally {
                ignoreLocal = false;
            }
        }
    }

    callLocal = this.call;
    fire = this.call;

    addProc(event, handler) {
        procHandlers[event] = handler;
    }

    addCommand(command, handler) {
        cmdHandlers[command] = handler;
    }

    hasPendingRpc(player) {
        player = toAlt(player);
        return player.__pendingRpc && Object.keys(player.__pendingRpc).length > 0;
    }

    cancelPendingRpc(player, id) {
        player = toAlt(player);
        if (!player.__pendingRpc) return;

        if (id != null) {
            player.__pendingRpc[id]?.reject(new Error('RPC was cancelled'));
            delete player.__pendingRpc[id];
            return;
        }

        for (const value of Object.values(player.__pendingRpc)) {
            value.reject(new Error('RPC was cancelled'));
        }
        player.__pendingRpc = {};
    }
}

mp.events = new _Events;
mp._events = mp.events;
