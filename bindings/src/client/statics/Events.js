import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { argsToAlt, argsToMp } from '../../shared/utils.js';
import { Deferred } from '../../shared/Deferred';

class _Events {
    #handlers = {}
    #procHandlers = {}
    #rpcId = 0;
    __pendingRpc = {}

    constructor() {
        alt.onServer((event, ...args) => {
            this.dispatch(event, ...argsToMp(args));
        });
        alt.on((event, ...args) => {
            if (event == 'consoleCommand') return; // dispatched in Console.js
            this.dispatch(event, ...argsToMp(args));
        });
        alt.onServer(mp.prefix + 'repl', (id, res) => {
            this.__pendingRpc[id].resolve(argsToMp([res])[0]);
            delete this.__pendingRpc[id];
        });
        alt.onServer(mp.prefix + 'replError', (id, res) => {
            this.__pendingRpc[id].reject(argsToMp([res])[0]);
            delete this.__pendingRpc[id];
        });
        alt.onServer(mp.prefix + 'call', (event, id, ...args) => {
            this.dispatchRemoteProc(event, id, ...args);
        });
        alt.everyTick(() => {
            this.dispatch('render');
        });
        alt.on('gameEntityCreate', (entity) => {
            this.dispatch('entityStreamIn', entity?.mp);
        });
        alt.on('gameEntityDestroy', (entity) => {
            this.dispatch('entityStreamOut', entity?.mp);
        });
    }

    add(key, fn) {
        if (typeof key === 'object') {
            for (const [innerKey, innerValue] of Object.entries(key))
                this.add(innerKey, innerValue);
            return;
        }
        if (!(key in this.#handlers)) this.#handlers[key] = new Set;
        this.#handlers[key].add(fn);
    }

    addDataHandler(expectedKey, fn) {
        function handler(entity, key, newData, oldData) {
            if (key != expectedKey) return;
            fn(entity, newData, oldData);
        }

        alt.on('syncedMetaChange', handler);
        alt.on('streamSyncedMetaChange', handler);
    }

    remove(key, fn) {
        if (typeof key === 'object' && Array.isArray(key)) {
            for (const el of key)
                this.remove(el);
            return;
        }

        if (key in this.#handlers) {
            if (!fn) this.#handlers[key].clear();
            else this.#handlers[key].delete(fn);
        }

        if (key in this.#procHandlers) {
            if (!fn) delete this.#procHandlers[key];
            else if (this.#procHandlers[key] === fn) delete this.#procHandlers[key];
        }
    }

    getAllOf(key) {
        return key in this.#handlers ? [...this.#handlers[key].values()] : [];
    }

    reset() {
        this.#handlers = {};
    }

    hasHandlers(event) {
        return !!this.#handlers[event] && !!this.#handlers[event].size;
    }

    dispatch(event, ...args) {
        if (!(event in this.#handlers)) return;
        for (const handler of this.#handlers[event]) handler(...args);
    }

    call(event, ...args) {
        alt.emit(event, ...argsToAlt(args));
    }

    callLocal(event, ...args) {
        this.call(event, ...args);
    }

    fire(event, ...args) {
        this.call(event, ...args);
    }

    callRemote(event, ...args) {
        alt.emitServer(event, ...argsToAlt(args));
    }

    callRemoteUnreliable(event, ...args) {
        alt.emitServerUnreliable(event, ...argsToAlt(args));
    }

    callRemoteProc(event, ...args) {
        const id = this.#rpcId++;
        const promise = new Deferred();
        this.__pendingRpc[id] = promise;
        alt.emitServer(mp.prefix + 'call', id, event, ...args);
        setTimeout(() => {
            promise.reject(new Error('Timed-out'));
            delete this.__pendingRpc[id];
        }, 30000);
        return promise;
    }

    dispatchRemoteProc(event, id, ...args) {
        const handler = this.#procHandlers[event];
        if (!handler) return;
        try {
            const result = handler(...args);
            alt.emitServer(mp.prefix + 'repl', id, result);
        } catch(e) {
            alt.emitServer(mp.prefix + 'replError', id, e);
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
}

mp.events = new _Events;