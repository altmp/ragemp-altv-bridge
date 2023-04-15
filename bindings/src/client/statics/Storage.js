import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

class _Storage {
    constructor() {
        alt.on('resourceStop', () => {
            alt.LocalStorage.save();
        });
    }

    flush() {
        alt.LocalStorage.save();
    }

    #sessionData = {};
    get sessionData() {
        // todo keep between resource reloads?
        return this.#sessionData;
    }

    #data;
    get data() {
        const obj = {};
        return this.#data ??= new Proxy({}, {
            get(_, key) {
                if (typeof key != 'string') return obj[key];
                return alt.LocalStorage.get(key);
            },
            set(_, key, value) {
                if (typeof key != 'string') return;
                alt.LocalStorage.set(key, value);
                return true;
            }
        })
    }
}

mp.storage = new _Storage;
