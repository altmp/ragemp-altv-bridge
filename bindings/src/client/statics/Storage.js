import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

class _Storage {
    constructor() {
        alt.on('resourceStop', () => {
            this.flush();
        });
    }

    flush() {
        for (const [key, value] of this.#dataCache)
            alt.LocalStorage.set(key, value);
        for (const [key, value] of this.#sessionDataCache)
            alt.setMeta(key, value);
        alt.LocalStorage.save();
    }

    #sessionDataCache = new Map;
    #sessionData;
    get sessionData() {
        const obj = {};
        return this.#sessionData ??= new Proxy({}, {
            get(_, key) {
                if (typeof key != 'string') return obj[key];

                if (!this.#sessionDataCache.has(key)) {
                    const instance = alt.getMeta(key);
                    this.#sessionDataCache.set(key, instance);
                }

                return this.#sessionDataCache.get(key);
            },
            set(_, key, value) {
                if (typeof key != 'string') return;

                this.#sessionDataCache.set(key, value);
                alt.setMeta(key, value);
                return true;
            }
        });
    }


    #dataCache = new Map;
    #data;
    get data() {
        const obj = {};
        return this.#data ??= new Proxy({}, {
            get: (_, key) => {
                if (typeof key != 'string') return obj[key];

                if (!this.#dataCache.has(key)) {
                    const instance = alt.LocalStorage.get(key);
                    this.#dataCache.set(key, instance);
                }

                return this.#dataCache.get(key);
            },
            set: (_, key, value) => {
                if (typeof key != 'string') return;

                this.#dataCache.set(key, value);
                alt.LocalStorage.set(key, value);
                return true;
            }
        });
    }
}

mp.storage = new _Storage;
