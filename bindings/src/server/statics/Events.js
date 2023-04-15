import * as alt from 'alt-server';
import mp from '../../shared/mp.js';
import {argsToAlt, argsToMp, toAlt, toMp} from '../../shared/utils.js';
import { Deferred } from '../../shared/Deferred';
import {BaseEvents} from '../../shared/BaseEvents';
import { InternalChat } from 'shared/DefaultChat.js';

class _Events extends BaseEvents {
    #procHandlers = {}

    constructor() {
        super();

        alt.onClient((event, player, ...args) => {
            this.dispatch(event, player, ...argsToMp(args));
        });
        alt.on((event, ...args) => {
            this.dispatch(event, ...argsToMp(args));
        });
        alt.onClient(mp.prefix + 'repl', (player, id, res) => {
            if (!player.__pendingRpc || !(id in player.__pendingRpc)) return;
            player.__pendingRpc[id].resolve(toMp(res));
            delete player.__pendingRpc[id];
        });
        alt.onClient(mp.prefix + 'replError', (player, id, res) => {
            if (!player.__pendingRpc || !(id in player.__pendingRpc)) return;
            player.__pendingRpc[id].reject(toMp(res));
            delete player.__pendingRpc[id];
        });
        alt.onClient(mp.prefix + 'call', (player, event, id, ...args) => {
            this.dispatchRemoteProc(player, event, id, ...args);
        });

        alt.on('baseObjectCreate', (obj) => {
            if (obj.mp) this.dispatch('entityCreated', obj.mp);
        });
        alt.on('baseObjectRemove', (obj) => {
            if (obj.mp) this.dispatch('entityDestroyed', obj.mp);
        })
    }

    /** @internal */
    async dispatchRemoteProc(altPlayer, event, id, ...args) {
        const handler = this.#procHandlers[event];
        if (!handler) return altPlayer.emit(mp.prefix + 'replError', id, 'RPC not found');
        try {
            const result = await handler(toMp(altPlayer), ...argsToMp(args));
            altPlayer.emit(mp.prefix + 'repl', id, toAlt(result));
        } catch(e) {
            altPlayer.emit(mp.prefix + 'replError', id, toAlt(e));
        }
    }

    /** @internal */
    callRemoteProc(player, event, ...args) {
        if (!('__lastRpcId' in player)) player.__lastRpcId = 0;
        const id = player.__lastRpcId++;
        const deferred = new Deferred();
        if (!player.__pendingRpc) player.__pendingRpc = {};
        player.__pendingRpc[id] = deferred;
        player.emit(mp.prefix + 'call', event, id, ...argsToAlt(args));
        setTimeout(() => {
            deferred.reject(new Error('Timed-out'));
            delete player.__pendingRpc[id];
        }, 30000);
        return deferred.promise;
    }

    call(event, ...args) {
        alt.emit(event, ...argsToAlt(args));
    }

    callLocal = this.call
    fire = this.call

    addProc(event, handler) {
        this.#procHandlers[event] = handler;
    }

    addCommand(command, handler) {
        InternalChat.add(command, handler);
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
mp._events = new _Events;
