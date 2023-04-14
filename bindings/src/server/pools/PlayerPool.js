import alt from 'alt-server';
import { Pool } from './Pool.js';
import { InternalChat } from 'shared/DefaultChat.js';
import { argsToAlt } from 'shared/utils';

export class PlayerPool extends Pool {
    broadcast(text) {
        InternalChat.broadcast(text);
    }
    
    //mp.players.call(String eventName[, Array Arguments]);
    //mp.players.call(Array players, String eventName[, Array Arguments]);
    call(arg1, args1 = [], args2 = []) {
        if(typeof arg1 === 'string') {
            alt.emitAllClients(arg1, ...argsToAlt(args1));
        } else if(typeof arg1 === 'object' && Array.isArray(arg1)) {
            alt.emitClient(arg1.map(p => p.alt), args1, ...argsToAlt(args2));
        }
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
}