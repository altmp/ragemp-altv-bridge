import * as alt from 'alt-server';
import mp from '../../shared/mp';
import {altDimensionToMp, mpDimensionToAlt, toAlt, toMp, vdist, vdist2} from '../../shared/utils';
import { _BaseObject } from './BaseObject';

export class _WorldObject extends _BaseObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super();
        this.#alt = alt;
    }

    setVariable(key, value) {
        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key)) this.setVariable(innerKey, innerValue);
            return;
        }

        this.#alt.setSyncedMeta(key, toAlt(value));
    }

    setVariables(obj) {
        this.setVariable(obj);
    }

    getVariable(key) {
        return toMp(this.#alt.getSyncedMeta(key));
    }

    hasVariable(key) {
        return this.#alt.hasSyncedMeta(key);
    }

    dist(pos) {
        return vdist(this.alt.pos, pos);
    }

    distSquared(pos) {
        return vdist2(this.alt.pos, pos);
    }

    get dimension() {
        return altDimensionToMp(this.alt.dimension);
    }

    set dimension(value) {
        this.alt.dimension = mpDimensionToAlt(value);
    }

    get id() {
        return this.alt.id;
    }

    destroy() {
        if (!this.alt.valid) return;
        this.#alt.destroy();
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }
}
