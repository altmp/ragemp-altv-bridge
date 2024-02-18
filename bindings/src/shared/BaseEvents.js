import mp from './mp';
import {argsToMp, measureExecute, safeExecute} from './utils';
import * as alt from 'alt-shared';

let handlers = {};
let localHandlers = {};
export class BaseEvents {

    add(key, fn) {
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
        fn.from = String((new Error()).stack.substring(8));
        handlers[key].add(fn);
    }

    addLocal(key, fn) {
        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key))
                this.addLocal(innerKey, innerValue);
            return;
        }
        if (mp.debug) alt.log('Registering', key);
        if (!(key in localHandlers)) {
            if (mp.debug) alt.log('Registering2', key);
            localHandlers[key] = new Set;
        }
        fn.from = String((new Error()).stack.substring(8));
        localHandlers[key].add(fn);
    }

    remove(key, fn) {
        if (typeof key === 'object' && Array.isArray(key)) {
            for (const el of key)
                this.remove(el);
            return;
        }

        if (key in handlers) {
            if (!fn) handlers[key].clear();
            else handlers[key].delete(fn);
        }

        if (key in localHandlers) {
            if (!fn) localHandlers[key].clear();
            else localHandlers[key].delete(fn);
        }
    }

    getAllOf = (key) => {
        return key in handlers ? [...handlers[key].values()] : [];
    };

    reset = () => {
        handlers = {};
        localHandlers = {};
    };

    hasHandlers = (event) => {
        return !!handlers[event] && !!handlers[event].size;
    };

    /** @internal */
    dispatch(event, ...args) {
        if (!(event in handlers)) return;
        const what = event + ' event handler';
        for (const handler of handlers[event]) {
            measureExecute(() => safeExecute(handler, what, this, ...args), mp._measureEvents, what, handler.from);
        }
    }

    /** @internal */
    dispatchLocal(event, ...args) {
        this.dispatch(event, ...args);

        if (!(event in localHandlers)) return;
        const what = event + ' local event handler';
        for (const handler of localHandlers[event]) {
            measureExecute(() => safeExecute(handler, what, this, ...args), mp._measureEvents, what, handler.from);
        }
    }

    /** @internal */
    dispatchLocalWithResults(event, ...args) {
        if (!(event in handlers)) return;
        return handlers[event].map(e => e(...args));
    }
}
