import { Pool } from './Pool.js';

export class PlayerPool extends Pool {
    broadcast(text) {
        console.log('[BROADCAST]', text);
    }
    
    //mp.players.call(String eventName[, Array Arguments]);
    //mp.players.call(Array players, String eventName[, Array Arguments]);
    call(arg1, args1 = [], args2 = []) {
        if(typeof arg1 === 'string') {
            this.forEach(p => p.call(arg1, args1));
        } else if(typeof arg1 === 'object' && Array.isArray(arg1)) {
            arg1.forEach(p => p.call(args1, args2));
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