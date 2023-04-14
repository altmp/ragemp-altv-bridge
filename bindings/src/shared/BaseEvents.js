import mp from './mp';
import {argsToMp} from './utils';
import * as alt from 'alt-shared';

export class BaseEvents {
    #handlers = {}

    add(key, fn) {
        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key))
                this.add(innerKey, innerValue);
            return;
        }
        if (!(key in this.#handlers)) this.#handlers[key] = new Set;
        this.#handlers[key].add(fn);
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

    /** @internal */
    dispatch(event, ...args) {
        if(event != 'render' && mp.debug)alt.log('Dispatching1', event);
        if (!(event in this.#handlers)) return;
        argsToMp(args);
        if(event != 'render' && mp.debug)alt.log('Dispatching2', event);
        for (const handler of this.#handlers[event]) handler(...args);
    }

    /** @internal */
    dispatchWithResults(event, ...args) {
        if(event != 'render' && mp.debug)alt.log('dispatchWithResults1', event);
        if (!(event in this.#handlers)) return;
        argsToMp(args);
        if(event != 'render' && mp.debug)alt.log('dispatchWithResults2', event);
        return this.#handlers[event].map(e => e(...args));
    }
}
