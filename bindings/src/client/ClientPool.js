import { SharedPool } from '../shared/SharedPool';
import { vdist2 } from '../shared/utils';

export class ClientPool extends SharedPool {
    /** @type {EntityBaseView} */
    #view;

    constructor(view) {
        super(view);
        this.#view = view;
    }

    atRemoteId(id) {
        return this.#view.getByRemoteID(id);
    }

    atHandle(id) {
        return this.#view.getByScriptID(id);
    }

    forEachInStreamRange(fn) {
        this.#view.toArrayInStreamRange().forEach(e => fn(e, e.id));
    }
}
