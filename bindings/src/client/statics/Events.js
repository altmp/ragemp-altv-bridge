import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {argsToAlt, argsToMp, toAlt, toMp} from '../../shared/utils.js';
import { Deferred } from '../../shared/Deferred';
import {BaseEvents} from '../../shared/BaseEvents';

class _Events extends BaseEvents {
    #procHandlers = {}
    #rpcId = 0;
    __pendingRpc = {}

    constructor() {
        super();

        alt.onServer((event, ...args) => {
            this.dispatch(event, ...argsToMp(args));
        });
        alt.on((event, ...args) => {
            if (event === 'consoleCommand') return; // dispatched in Console.js
            this.dispatch(event, ...argsToMp(args));
        });
        alt.onServer(mp.prefix + 'repl', (id, res) => {
            this.__pendingRpc[id].resolve(toMp(res));
            delete this.__pendingRpc[id];
        });
        alt.onServer(mp.prefix + 'replError', (id, res) => {
            this.__pendingRpc[id].reject(toMp(res));
            delete this.__pendingRpc[id];
        });
        alt.onServer(mp.prefix + 'call', (event, id, ...args) => {
            this.dispatchRemoteProc(event, id, ...args);
        });

        alt.everyTick(() => {
            this.dispatch('render');
        });
        alt.on('gameEntityCreate', (entity) => {
            this.dispatch('entityStreamIn', toMp(entity));
        });
        alt.on('gameEntityDestroy', (entity) => {
            this.dispatch('entityStreamOut', toMp(entity));
        });
    }

    addDataHandler(expectedKey, fn) {
        function handler(entity, key, newData, oldData) {
            if (key !== expectedKey) return;
            fn(entity, newData, oldData);
        }

        alt.on('syncedMetaChange', handler);
        alt.on('streamSyncedMetaChange', handler);
    }

    call(event, ...args) {
        if(mp.debug)console.log(event);
        alt.emit(event, ...argsToAlt(args));
    }

    callLocal = this.call;
    fire = this.call;

    //#region RPC
    callRemote(event, ...args) {
        if(mp.debug)console.log(event);
        alt.emitServer(event, ...argsToAlt(args));
    }

    callRemoteUnreliable(event, ...args) {
        if(mp.debug)console.log(event);
        alt.emitServerUnreliable(event, ...argsToAlt(args));
    }

    callRemoteProc(event, ...args) {
        const id = this.#rpcId++;
        const deferred = new Deferred();
        this.__pendingRpc[id] = deferred;
        alt.emitServer(mp.prefix + 'call', event, id, ...argsToAlt(args));
        setTimeout(() => {
            deferred.reject(new Error('Timed-out'));
            delete this.__pendingRpc[id];
        }, 30000);
        return deferred.promise;
    }

    async dispatchRemoteProc(event, id, ...args) {
        const handler = this.#procHandlers[event];
        if (!handler) return alt.emitServer(mp.prefix + 'replError', id, 'RPC not found');
        try {
            const result = await handler(...argsToMp(args));
            alt.emitServer(mp.prefix + 'repl', id, toAlt(result));
        } catch(e) {
            alt.emitServer(mp.prefix + 'replError', id, toAlt(e));
        }
    }

    addProc(event, handler) {
        this.#procHandlers[event] = handler;
    }

    hasPendingProc() {
        return Object.keys(this.__pendingRpc).length > 0;
    }

    cancelPendingProc(id) {
        if (id != null) {
            this.__pendingRpc[id]?.reject(new Error('RPC was cancelled'));
            delete this.__pendingRpc[id];
            return;
        }

        for (const [key, value] of Object.entries(this.__pendingRpc)) {
            value.reject(new Error('RPC was cancelled'));
        }
        this.__pendingRpc = {};
    }
    //#endregion
}

mp.events = new _Events;
mp._events = new _Events;
