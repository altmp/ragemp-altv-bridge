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
        const hasDimension = dimension != null;
        return alt.getEntitiesInRange(pos, range, hasDimension ? dimension : alt.globalDimension, this.#filterType).map(e => e.mp);
    }

    forEachInRange(pos, range, dimension, fn) {
        if (!this.#filterType) return super.forEachInRange(pos, range, dimension, fn);
        const hasDimension = !!fn;
        if (!fn) fn = dimension;
        const arr = alt.getEntitiesInRange(pos, range, hasDimension ? dimension : alt.globalDimension, this.#filterType);
        const length = arr.length;
        for (let i = 0; i < length; i++) {
            const e = arr[i];
            fn(e.mp);
        }
    }

    getClosest(pos, limit) {
        if (!this.#filterType) return super.getClosest(pos, limit);
        const arr = alt.getClosestEntities(pos, 999999, alt.globalDimension, limit, this.#filterType);
        if (limit === 1) return arr[0].mp;
        return arr.map(e => e.mp);
    }

    getClosestInDimension(pos, dimension, limit) {
        if (!this.#filterType) return super.getClosestInDimension(pos, dimension, limit);
        const arr = alt.getClosestEntities(pos, 999999, dimension, limit, this.#filterType);
        if (limit === 1) return arr[0].mp;
        return arr.map(e => e.mp);
    }
}
