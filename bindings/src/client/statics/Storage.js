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
        return this.#data ??= new Proxy({}, {
            get(_, key) {
                return alt.LocalStorage.get(key);
            },
            set(_, key, value) {
                alt.LocalStorage.set(key, value);
            }
        })
    }
}

mp.storage = new _Storage;