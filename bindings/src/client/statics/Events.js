import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {argsToAlt, argsToMp, emit, internalName, safeExecute, toAlt, toMp} from '../../shared/utils.js';
import { Deferred } from '../../shared/Deferred';
import {BaseEvents} from '../../shared/BaseEvents';
import {emitServer, emitServerUnreliable} from '../clientUtils';

let procHandlers = {};
let rpcId = 0;
let __pendingRpc = {};
let ignoreLocal = false;

class _Events extends BaseEvents {

    constructor() {
        super();

        alt.onServer((event, ...args) => {
            if (event.startsWith(mp.prefix)) return;
            mp.notifyTrace('event', 'server event ', event);
            this.dispatchLocal(event, ...argsToMp(args));
        });
        alt.on((event, ...args) => { // custom events only
            if (ignoreLocal) return;
            if (event.startsWith(mp.prefix)) return;
            mp.notifyTrace('event', 'local event ', event);
            this.dispatchLocal(event, ...argsToMp(args));
        });
        alt.onServer(internalName('repl'), (id, res) => {
            __pendingRpc[id].resolve(toMp(res));
            delete __pendingRpc[id];
        });
        alt.onServer(internalName('replError'), (id, res) => {
            __pendingRpc[id].reject(toMp(res));
            delete __pendingRpc[id];
        });
        alt.onServer(internalName('call'), (event, id, ...args) => {
            this.dispatchRemoteProc(event, id, ...args);
        });

        // render event is now being dispatched in Nametags.js

        if (mp._main) {
            alt.on('gameEntityCreate', (entity) => {
                mp.notifyTrace('event', 'entity create ', entity);
                this.dispatchLocal('entityStreamIn', toMp(entity));
            });
            alt.on('gameEntityDestroy', (entity) => {
                mp.notifyTrace('event', 'entity destroy ', entity);
                this.dispatchLocal('entityStreamOut', toMp(entity));
            });
        }
    }

    addDataHandler(expectedKey, fn) {
        function dataHandlerWrapper(type, entity, key, newData, oldData) {
            if (entity === alt.Player.local && type === 'streamSyncedMetaChange') return; // use localMeta for local player
            if (key !== expectedKey) return;
            mp.notifyTrace('event', 'data change ', expectedKey);
            safeExecute(fn, `${expectedKey} data handler`, null, toMp(entity), newData, oldData);
        }

        alt.on('syncedMetaChange', dataHandlerWrapper.bind(null, 'syncedMetaChange'));
        alt.on('streamSyncedMetaChange', dataHandlerWrapper.bind(null, 'streamSyncedMetaChange'));
        alt.on('localMetaChange', dataHandlerWrapper.bind(null, 'localMetaChange', alt.Player.local));
    }

    call(event, ...args) {
        mp.notifyTrace('event', 'call local event ', event);
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

    //region RPC
    callRemote(event, ...args) {
        mp.notifyTrace('event', 'call remote ', event);
        emitServer(event, ...argsToAlt(args));
    }

    callRemoteUnreliable(event, ...args) {
        mp.notifyTrace('event', 'call remote unreliable ', event);
        emitServerUnreliable(event, ...argsToAlt(args));
    }

    callRemoteProc(event, ...args) {
        mp.notifyTrace('event', 'call remote proc ', event);
        const id = rpcId++;
        const deferred = new Deferred();
        __pendingRpc[id] = deferred;
        emitServer(internalName('call'), event, id, ...argsToAlt(args));
        setTimeout(() => {
            deferred.reject(new Error('Timed-out'));
            delete __pendingRpc[id];
        }, 30000);
        return deferred.promise;
    }

    async dispatchRemoteProc(event, id, ...args) {
        mp.notifyTrace('event', 'dispatch remote proc ', event);
        const handler = procHandlers[event];
        if (!handler) return emitServer(internalName('replError'), id, 'RPC not found');
        try {
            const result = await handler(...argsToMp(args));
            emitServer(internalName('repl'), id, toAlt(result));
        } catch(e) {
            emitServer(internalName('replError'), id, toAlt(e));
        }
    }

    addProc(event, handler) {
        procHandlers[event] = handler;
    }

    hasPendingProc() {
        return Object.keys(__pendingRpc).length > 0;
    }

    cancelPendingProc(id) {
        if (id != null) {
            __pendingRpc[id]?.reject(new Error('RPC was cancelled'));
            delete __pendingRpc[id];
            return;
        }

        for (const [key, value] of Object.entries(__pendingRpc)) {
            value.reject(new Error('RPC was cancelled'));
        }
        __pendingRpc = {};
    }
    //endregion
}

mp.events = new _Events;
mp._events = mp.events;
