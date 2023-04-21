import * as alt from 'alt-client';
import {mpDimensionToAlt, toMp, vdist, vdist2} from '../../shared/utils';
import { _BaseObject } from './BaseObject';
import natives from 'natives';

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
        return this.alt.dimension ?? alt.Player.local.dimension;
    }

    set dimension(value) {
        console.log('Setting dimension to', value, mpDimensionToAlt(value));
        this.alt.dimension = mpDimensionToAlt(value);
    }

    get id() {
        return this.alt.id;
    }

    get remoteId() {
        return this.alt.remoteId ?? this.alt.id;
    }

    get handle() {
        return this.alt.scriptID;
    }

    get model() {
        return this.alt.model;
    }

    get valid() {
        return this.alt.valid;
    }

    set position(value) {
        natives.setEntityCoordsNoOffset(this.handle, value.x, value.y, value.z, false, false, false);
    }
}
