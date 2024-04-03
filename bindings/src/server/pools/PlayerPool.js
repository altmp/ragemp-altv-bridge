import alt from 'alt-server';
import { ServerPool } from './ServerPool.js';
import { InternalChat } from 'shared/DefaultChat.js';
import {argsToAlt, mpDimensionToAlt} from 'shared/utils';
import {emitAllClients, emitAllClientsUnreliable, emitClient, emitClientUnreliable} from '../serverUtils';

export class PlayerPool extends ServerPool {
    broadcast(text) {
        InternalChat.broadcast(text);
    }

    exists(player) {
        if (player == null) return false;

        if (typeof player === 'object') {
            if (player.alt instanceof alt.Player) return player.alt.valid;
            return false;
        }

        return super.exists(player);
    }

    //mp.players.call(String eventName[, Array Arguments]);
    //mp.players.call(Array players, String eventName[, Array Arguments]);
    call(arg1, args1 = [], args2 = []) {
        if(typeof arg1 === 'string') {
            emitAllClients(arg1, ...argsToAlt(args1));
        } else if(typeof arg1 === 'object' && Array.isArray(arg1)) {
            const players = arg1.map(p => p.alt).filter(Boolean);
            if (players.length) emitClient(players, args1, ...argsToAlt(args2));
        }
    }

    callUnreliable(arg1, args1 = [], args2 = []) {
        if(typeof arg1 === 'string') {
            emitAllClientsUnreliable(arg1, ...argsToAlt(args1));
        } else if(typeof arg1 === 'object' && Array.isArray(arg1)) {
            const players = arg1.map(p => p.alt).filter(Boolean);
            if (players.length) emitClientUnreliable(players, args1, ...argsToAlt(args2));
        }
    }

    // todo: callInRange(pos, range, dimension, event, ...args)
    // TODO: callInRange in core
    callInRange(pos, range, event, args) {
        const players = alt.getEntitiesInRange(pos, range, alt.globalDimension, 1);
        if (players.length) emitClient(players, event, ...argsToAlt(args));
    }

    // TODO: callInDimension in core
    callInDimension(dimension, event, args) {
        dimension = mpDimensionToAlt(dimension);
        const players = alt.getEntitiesInDimension(dimension, 1);
        if (players.length) emitClient(players, event, ...argsToAlt(args));
    }
    /*
    broadcastInDimension(dimension, text){}
    broadcastInRange(position, range, [dimension], text){}
    callInDimension(dimension, eventName, [, ...args]){}
    callInRange(position, range, [dimension], eventName, [, ...args]){}
    callUnreliable(eventName, [, ...args]){}
    callInDimensionUnreliable(){}
    callInRangeUnreliable(){}
    reloadResources(){}
    */

    get size() {
        return alt.getServerConfig().players;
    }
}
