import { SharedPool } from '../../shared/SharedPool';
import { vdist2 } from '../../shared/utils';
import alt from 'alt-server';

export class ServerPool extends SharedPool {
    #filterType;

    constructor(view, classes = [], filterType = 0) {
        super(view, classes);
        this.#filterType = filterType;
    }

    toArrayInRange(pos, range, dimension) {
        if (!this.#filterType) return super.toArrayInRange(pos, range, dimension);
        return alt.getEntitiesInRange(pos, range, dimension, this.#filterType).map(e => e.mp);
    }

    forEachInRange(pos, range, dimension, fn) {
        if (!this.#filterType) return super.forEachInRange(pos, range, dimension, fn);
        const hasDimension = !!fn;
        if (!fn) fn = dimension;
        return alt.getEntitiesInRange(pos, range, dimension, this.#filterType).forEach(e => fn(e.mp));
    }
}
