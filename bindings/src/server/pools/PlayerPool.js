import { Pool } from './Pool.js';

export class PlayerPool extends Pool {
    broadcast(text) {
        console.log('[BROADCAST]', text);
    }
    
    call(arg1, args = []) {
        if(arg1 instanceof String) {
            this.forEach(p => p.call(arg1, args));
        } else if(arg1 instanceof Array) {
            arg1.forEach(p => p.call(arg1, args));
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