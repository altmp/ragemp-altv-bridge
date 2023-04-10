import * as alt from 'alt-client';
import {toMp, vdist, vdist2} from '../../shared/utils';
import { _BaseObject } from './BaseObject';

export class _WorldObject extends _BaseObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super();
        this.#alt = alt;
    }

    getVariable(key) {
        return toMp(this.#alt.getSyncedMeta(key));
    }

    dist(pos) {
        return vdist(this.alt.pos, pos);
    }

    distSquared(pos) {
        return vdist2(this.alt.pos, pos);
    }

    get dimension() {
        return 0; // TODO: dimension
    }

    get id() {
        return this.alt.id;
    }
}
