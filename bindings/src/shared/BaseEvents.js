import mp from './mp';
import {argsToMp} from './utils';
import * as alt from 'alt-shared';

let handlers = {};
export class BaseEvents {

    add = (key, fn) => {
        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key))
                this.add(innerKey, innerValue);
            return;
        }
        if (mp.debug) alt.log('Registering', key);
        if (!(key in handlers)) {
            if (mp.debug) alt.log('Registering2', key);
            handlers[key] = new Set;
        }
        handlers[key].add(fn);
    }

    remove = (key, fn) => {
        if (typeof key === 'object' && Array.isArray(key)) {
            for (const el of key)
                this.remove(el);
            return;
        }

        if (key in handlers) {
            if (!fn) handlers[key].clear();
            else handlers[key].delete(fn);
        }
    }

    getAllOf = (key) => {
        return key in handlers ? [...handlers[key].values()] : [];
    }

    reset = () => {
        handlers = {};
    }

    hasHandlers = (event) => {
        return !!handlers[event] && !!handlers[event].size;
    }

    /** @internal */
    dispatch = (event, ...args) => {
        if(event != 'render' && mp.debug)alt.log('Dispatching1', event, handlers[event] != null);
        if (!(event in handlers)) return;
        argsToMp(args);
        if(event != 'render' && mp.debug)alt.log('Dispatching2', event);
        for (const handler of handlers[event]) handler(...args);
    }

    /** @internal */
    dispatchWithResults = (event, ...args) => {
        if(event != 'render' && mp.debug)alt.log('dispatchWithResults1', event);
        if (!(event in handlers)) return;
        argsToMp(args);
        if(event != 'render' && mp.debug)alt.log('dispatchWithResults2', event);
        return handlers[event].map(e => e(...args));
    }
}
