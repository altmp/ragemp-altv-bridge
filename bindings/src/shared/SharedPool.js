import {mpDimensionToAlt, vdist2} from '../shared/utils';

export class SharedPool {
    #getter;
    #idGetter;
    #lengthGetter;

    constructor(getter, idGetter, lengthGetter) {
        this.#getter = getter;
        this.#idGetter = idGetter;
        this.#lengthGetter = lengthGetter ?? (() => this.#getter().length);
    }

    at(id) {
        return this.#idGetter(id)?.mp ?? null;
    }

    exists(id) {
        if (typeof id === 'object' && id) return id.valid ?? id?.alt?.valid ?? false;
        return this.#idGetter(id) != null;
    }

    toArray() {
        return this.#getter().map(e => e.mp);
    }

    toArrayFast() {
        return this.#getter().map(e => e.mp);
    }

    forEach(fn) {
        this.#getter().forEach(e => fn(e.mp, e.id));
    }

    forEachFast(fn) {
        this.forEach(fn);
    }

    apply(fn) {
        this.forEach(fn);
    }

    toArrayInRange(pos, range, dimension) {
        dimension = mpDimensionToAlt(dimension);
        const hasDimension = dimension != null;
        range = range ** 2;
        let arr = this.#getter();
        if (hasDimension) arr = arr.filter(e => e.dimension == dimension);
        return arr.filter(e => vdist2(e.pos.x, e.pos.y, e.pos.z, pos.x, pos.y, pos.z) <= range).map(e => e.mp);
    }

    forEachInDimension(dimension, fn) {
        dimension = mpDimensionToAlt(dimension);
        this.#getter().filter(e => e.dimension == dimension).forEach(e => fn(e.mp, e.id));
    }

    forEachInRange(pos, range, dimension, fn) {
        dimension = mpDimensionToAlt(dimension);
        const hasDimension = !!fn;
        if (!fn) fn = dimension;
        range = range ** 2;
        let arr = this.#getter();
        if (hasDimension) arr = arr.filter(e => e.dimension == dimension);
        arr.filter(e => vdist2(e.pos.x, e.pos.y, e.pos.z, pos.x, pos.y, pos.z) <= range).forEach(e => fn(e.mp, e.id));
    }

    getClosest(pos, limit) {
        const arr = this.#getter();
        for (let i = 0; i < arr.length; i++) {
            const e = arr[i];
            e._dist = vdist2(e.pos.x, e.pos.y, e.pos.z, pos.x, pos.y, pos.z);
        }
        const sorted = arr.sort((a, b) => a._dist - b._dist);
        if (!limit || limit == 1)
            return sorted[0];

        return sorted.slice(0, limit).map(e => e.mp);
    }

    getClosestInDimension(pos, dimension, limit) {
        dimension = mpDimensionToAlt(dimension);
        const arr = this.#getter().filter(e => e.dimension == dimension);
        for (let i = 0; i < arr.length; i++) {
            const e = arr[i];
            e._dist = vdist2(e.pos.x, e.pos.y, e.pos.z, pos.x, pos.y, pos.z);
        }
        const sorted = arr.sort((a, b) => a._dist - b._dist);
        if (!limit || limit == 1)
            return sorted[0];

        return sorted.slice(0, limit).map(e => e.mp);
    }

    get length() {
        return this.#lengthGetter();
    }

    get size() {
        return 200; // TODO: wat?
    }
}
