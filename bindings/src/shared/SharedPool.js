import {mpDimensionToAlt, vdist2} from '../shared/utils';
import {EntityBaseView} from './pools/EntityBaseView';

export class SharedPool {
    /** @type {EntityBaseView} */
    #view;

    constructor(view) {
        this.#view = view;
    }

    at(id) {
        return this.#view.getByID(id);
    }

    exists(id) {
        if (typeof id === 'object' && id) return id.valid ?? id?.alt?.valid ?? false;
        return this.#view.has(id);
    }

    toArray() {
        return this.#view.toArray();
    }

    toArrayFast() {
        return this.toArray();
    }

    forEach(fn) {
        this.toArray().forEach(e => fn(e, e.id));
    }

    forEachFast(fn) {
        this.forEach(fn);
    }

    apply(fn) {
        this.forEach(fn);
    }

    toArrayInRange(pos, range, dimension) {
        const hasDimension = dimension != null;
        range = range ** 2;
        let arr = this.toArray();
        if (hasDimension) arr = arr.filter(e => e.dimension === dimension);
        return arr.filter(e => vdist2(e.pos, pos) <= range);
    }

    forEachInDimension(dimension, fn) {
        this.toArray().filter(e => e.dimension === dimension).forEach(e => fn(e, e.id));
    }

    forEachInRange(pos, range, dimension, fn) {
        const hasDimension = !!fn;
        if (!fn) fn = dimension;
        range = range ** 2;
        let arr = this.toArray();
        if (hasDimension) arr = arr.filter(e => e.dimension === dimension);
        arr.filter(e => vdist2(e.pos, pos) <= range).forEach(e => fn(e, e.id));
    }

    #getClosestFromArr(arr, pos, limit) {
        for (let i = 0; i < arr.length; i++) {
            const e = arr[i];
            e._dist = vdist2(e.pos, pos);
        }
        const sorted = arr.sort((a, b) => a._dist - b._dist);
        if (!limit || limit === 1)
            return sorted[0];

        return sorted.slice(0, limit);
    }

    getClosest(pos, limit) {
        const arr = this.toArray();
        return this.#getClosestFromArr(arr, pos, limit);
    }

    getClosestInDimension(pos, dimension, limit) {
        const arr = this.toArray().filter(e => e.dimension === dimension);
        return this.#getClosestFromArr(arr, pos, limit);
    }

    get length() {
        return this.#view.getCount();
    }
}
