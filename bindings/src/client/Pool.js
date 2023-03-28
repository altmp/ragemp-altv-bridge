import { SharedPool } from '../shared/SharedPool';
import { vdist2 } from '../shared/utils';

export class Pool extends SharedPool {
    #streamedGetter;

    constructor(getter, streamedGetter, idGetter, lengthGetter) {
        super(getter, idGetter, lengthGetter);
        this.#streamedGetter = streamedGetter;
    }

    forEachInStreamRange(fn) {
        this.#streamedGetter().forEach(e => fn(e.mp, e.id));
    }
}