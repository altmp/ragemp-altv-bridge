import {mpDimensionToAlt, vdist2} from '../shared/utils';
import {BaseObjectType} from '../shared/BaseObjectType';
import {EntityBaseView} from './pools/EntityBaseView';
import * as alt from 'alt-shared';

export class SharedPool {
    /** @type {EntityBaseView} */
    #view;
    #classes;
    isClientPool;

    constructor(view, classes = [], isClientPool = false) {
        this.#view = view;
        this.#classes = classes;
        this.isClientPool = isClientPool;

        alt.on('resourceStop', () => {
            const arr = this.toArray();
            const length = arr.length;
            for (let i = 0; i < length; i++) {
                const e = arr[i];
                const altEntity = e.alt;
                
                if (this.isClientPool &&
                    (altEntity.type == BaseObjectType.Player ||
                     altEntity.type == BaseObjectType.LocalPlayer ||
                     altEntity.type == BaseObjectType.Vehicle ||
                     altEntity.type == BaseObjectType.Object ||
                     (altEntity.type == BaseObjectType.VirtualEntity && altEntity.isRemote) ||
                     (altEntity.type == BaseObjectType.VirtualEntityGroup && altEntity.isRemote) ||
                     (altEntity.type == BaseObjectType.Colshape && altEntity.isRemote) ||
                     (altEntity.type == BaseObjectType.LocalPed && altEntity.isRemote) ||
                     (altEntity.type == BaseObjectType.LocalObject && altEntity.isRemote) ||
                     (altEntity.type == BaseObjectType.LocalVehicle && altEntity.isRemote) ||
                     (altEntity.type == BaseObjectType.Blip && altEntity.isRemote)))
                {
                    continue;
                }
                
                try {
                    e.destroy();
                } catch(e) {
                    //
                }
            }
        });
    }

    at(id) {
        return this.#view.getByID(id);
    }

    exists(id) {
        if (id == null) return false;

        if (typeof id === 'object') {
            for (let i = 0; i < this.#classes.length; i++) {
                if (this.#classes[i] === id.constructor) {
                    return id.valid ?? id?.alt?.valid;
                }
            }

            return false;
        }

        return this.#view.has(id);
    }

    toArray() {
        return this.#view.toArray();
    }

    toArrayFast() {
        return this.toArray();
    }

    forEach(fn) {
        const arr = this.toArray();
        const length = arr.length;
        for (let i = 0; i < length; i++) {
            const e = arr[i];
            fn(e, e.id);
        }
    }

    forEachFast(fn) {
        this.forEach(fn);
    }

    get streamed() {
        return this.#view.toArrayInStreamRange();
    }

    apply(fn) {
        this.forEach(fn);
    }

    toArrayInRange(pos, range, dimension) {
        const hasDimension = dimension != null;
        range = range ** 2;
        let arr = this.toArray();
        const predicate = hasDimension
            ? (e) => {
                return e.dimension === dimension && vdist2(e.position, pos) <= range;
            }
            : (e) => {
                return vdist2(e.position, pos) <= range;
            };
        return arr.filter(predicate);
    }

    forEachInDimension(dimension, fn) {
        const arr = this.toArray();
        for (let i = 0; i < arr.length; i++) {
            const e = arr[i];
            if (e.dimension === dimension) fn(e, e.id);
        }
    }

    forEachInRange(pos, range, dimension, fn) {
        const hasDimension = !!fn;
        if (!fn) fn = dimension;
        range = range ** 2;
        let arr = this.toArray();
        if (hasDimension) arr = arr.filter(e => e.dimension === dimension);
        for (let i = 0; i < arr.length; i++) {
            const e = arr[i];
            if (hasDimension && e.dimension !== dimension) continue;
            if (vdist2(e.position, pos) <= range) fn(e, e.id);
        }
    }

    #getClosestFromArr(arr, pos, limit) {
        for (let i = 0; i < arr.length; i++) {
            const e = arr[i];
            e._dist = vdist2(e.position, pos);
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
