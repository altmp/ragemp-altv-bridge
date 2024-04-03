import { SharedPool } from '../../shared/SharedPool';

export class ClientPool extends SharedPool {
    /** @type {EntityBaseView} */
    #view;

    constructor(view, classes) {
        super(view, classes);
        this.#view = view;
    }

    atRemoteId(id) {
        return this.#view.getByRemoteID(id);
    }

    atHandle(id) {
        return this.#view.getByScriptID(id);
    }

    forEachInStreamRange(fn) {
        const arr = this.#view.toArrayInStreamRange();
        const length = arr.length;
        for (let i = 0; i < length; i++) {
            const e = arr[i];
            fn(e, e.id);
        }
    }
}
