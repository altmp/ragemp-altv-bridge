import * as alt from 'alt-server';
import mp from '../../shared/mp';
import {altDimensionToMp, internalName, mpDimensionToAlt, toAlt, toMp, vdist, vdist2} from '../../shared/utils';
import { _BaseObject } from './BaseObject';

export class _WorldObject extends _BaseObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super();
        this.#alt = alt;
    }

    setVariable(key, value) {
        if (!this.#alt.valid) return;
        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key)) this.setVariable(innerKey, innerValue);
            return;
        }

        if (!mp._syncedMeta && this.#alt.setStreamSyncedMeta) {
            this.#alt.setStreamSyncedMeta(key, toAlt(value));
            return;
        }

        this.#alt.setSyncedMeta(key, toAlt(value));
    }

    setVariables(obj) {
        this.setVariable(obj);
    }

    getVariable(key) {
        if (!this.hasVariable(key)) return undefined;

        if (!mp._syncedMeta && this.#alt.getStreamSyncedMeta)
            return toMp(this.#alt.getStreamSyncedMeta(key));

        return toMp(this.#alt.getSyncedMeta(key));
    }

    hasVariable(key) {
        if (!this.#alt.valid) return false;

        if (!mp._syncedMeta && this.#alt.hasStreamSyncedMeta)
            return this.#alt.hasStreamSyncedMeta(key);

        return this.#alt.hasSyncedMeta(key);
    }

    dist(pos) {
        if (!this.#alt.valid) return 0;
        return vdist(this.#alt.pos, pos);
    }

    distSquared(pos) {
        if (!this.#alt.valid) return 0;
        return vdist2(this.#alt.pos, pos);
    }

    get dimension() {
        if (!this.#alt.valid) return 0;
        return altDimensionToMp(this.#alt.dimension);
    }

    set dimension(value) {
        if (!this.#alt.valid) return;
        this.#alt.dimension = mpDimensionToAlt(value);
        this.setVariable(internalName('dimension'), value);
    }

    get id() {
        if (!this.#alt.valid) return -1;
        return this.#alt.id;
    }

    destroy() {
        if (!this.#alt.valid) return;
        this.#alt.destroy();
    }

    get position() {
        if (!this.#alt.valid) return mp.Vector3.zero;
        return new mp.Vector3(this.#alt.pos);
    }

    set position(value) {
        if (!this.#alt.valid) return;
        this.#alt.pos = value;
    }

    get controller() {
        if (!this.#alt.valid) return undefined;
        return toMp(this.#alt.netOwner);
    }

    set controller(value) {
        if (!this.#alt.valid) return;
        this.#alt.setNetOwner(value?.alt ?? null, false);
    }
}
