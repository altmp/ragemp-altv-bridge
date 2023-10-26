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
        if (!this.alt.valid) return undefined;
        if (this.#alt[mp._hasSyncedMetaKey](key)) return toMp(this.#alt[mp._getSyncedMetaKey](key));
        if (this.#alt.getStreamSyncedMeta && this.#alt.hasStreamSyncedMeta(key)) return toMp(this.#alt.getStreamSyncedMeta(key));
        return undefined;
    }

    hasVariable(key) {
        if (!this.alt.valid) return false;
        if (this.#alt[mp._hasSyncedMetaKey](key)) return true;
        if (this.#alt.hasStreamSyncedMeta && this.#alt.hasStreamSyncedMeta(key)) return true;
        return false;
    }

    dist(pos) {
        if (!this.alt.valid) return 0;
        return vdist(this.alt.pos, pos);
    }

    distSquared(pos) {
        if (!this.alt.valid) return 0;
        return vdist2(this.alt.pos, pos);
    }

    get dimension() {
        if (!this.alt.valid) return 0;
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
        if (!this.alt.valid) return mp.Vector3.zero;
        return this.alt.pos;
    }

    set position(value) {
        if (!this.alt.valid) return;
        natives.setEntityCoordsNoOffset(this.handle, value.x, value.y, value.z, false, false, false);
    }


    get rotation() {
        if (!this.alt.valid) return mp.Vector3.zero;
        return new mp.Vector3(this.alt.rot.toDegrees());
    }

    set rotation(value) {
        if (!this.alt.valid) return;
        natives.setEntityRotation(this.handle, value.x, value.y, value.z, 2, false);
    }

    get controller() {
        if (!this.alt.valid) return undefined;
        return toMp(this.alt.netOwner);
    }
}
