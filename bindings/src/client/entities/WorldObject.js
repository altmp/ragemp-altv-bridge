import * as alt from 'alt-client';
import {altDimensionToMp, internalName, mpDimensionToAlt, toMp, vdist, vdist2} from '../../shared/utils';
import { _BaseObject } from './BaseObject';
import natives from 'natives';
import mp from '../../shared/mp';

export class _WorldObject extends _BaseObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super();
        this.#alt = alt;
    }

    getVariable(key) {
        if (this.#alt.hasSyncedMeta(key)) return toMp(this.#alt.getSyncedMeta(key));
        if (this.#alt.getStreamSyncedMeta && this.#alt.hasStreamSyncedMeta(key)) return toMp(this.#alt.getStreamSyncedMeta(key));
        return undefined;
    }

    hasVariable(key) {
        return this.#alt.hasSyncedMeta(key) || this.#alt.hasStreamSyncedMeta(key);
    }

    dist(pos) {
        return vdist(this.alt.pos, pos);
    }

    distSquared(pos) {
        return vdist2(this.alt.pos, pos);
    }

    get dimension() {
        return altDimensionToMp(this.getVariable(internalName('dimension')) ?? this.alt.dimension ?? alt.Player.local.dimension);
    }

    set dimension(value) {
        this.alt.dimension = mpDimensionToAlt(value);
    }

    get id() {
        if (!this.alt.valid) return -1;
        return this.alt.id;
    }

    get remoteId() {
        if (!this.alt.valid) return -1;
        return this.alt.remoteID ?? this.alt.id;
    }

    get handle() {
        if (!this.alt.valid) return 0;
        return this.alt.scriptID;
    }

    get model() {
        if (!this.alt.valid) return 0;
        return this.alt.model;
    }

    set model(value) {
        if (!this.alt.valid) return;
        this.alt.model = value;
    }

    get valid() {
        return this.alt.valid;
    }

    get position() {
        return this.alt.pos;
    }

    set position(value) {
        natives.setEntityCoordsNoOffset(this.handle, value.x, value.y, value.z, false, false, false);
    }


    get rotation() {
        return new mp.Vector3(this.alt.rot.toDegrees());
    }

    set rotation(value) {
        natives.setEntityRotation(this.handle, value.x, value.y, value.z, 2, false);
    }

    get controller() {
        return toMp(this.alt.netOwner);
    }
}
