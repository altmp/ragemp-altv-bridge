import * as alt from 'alt-server';
import { _WorldObject } from './WorldObject';
import {rad2deg, TemporaryContainer, TickCacheContainer, toAlt, toMp} from '../../shared/utils';
import mp from '../../shared/mp';

export class _Entity extends _WorldObject {
    #alt;
    #streamVariableCache = new Map();

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
    }

    setStreamVariable(key, value) {
        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key)) this.setStreamVariable(innerKey, innerValue);
            return;
        }

        if (value === undefined) {
            this.#streamVariableCache.delete(key);
        } else {
            this.#streamVariableCache.set(key, value);
        }

        this.#alt.setStreamSyncedMeta(key, toAlt(value));
    }

    setStreamVariables(obj) {
        this.setStreamVariable(obj);
    }

    getStreamVariable(key) {
        if (!mp._shareVariablesBetweenResources) return this.#streamVariableCache.get(key);
        if (!this.hasStreamVariable(key)) return undefined;
        return toMp(this.#alt.getStreamSyncedMeta(key));
    }

    hasStreamVariable(key) {
        if (!mp._shareVariablesBetweenResources) return this.#streamVariableCache.has(key);
        return this.#alt.hasStreamSyncedMeta(key);
    }

    #positionCache = new TickCacheContainer();
    get position() {
        return this.#positionCache.get(() => new mp.Vector3(this.#alt.pos));
    }
    set position(value) {
        this.#positionCache.set(value);
        this.alt.pos = new alt.Vector3(value);
    }

    #rotationCache = new TickCacheContainer();
    get rotation() {
        return this.#rotationCache.get(() => new mp.Vector3(this.#alt.rot.x * rad2deg, this.#alt.rot.y * rad2deg, this.#alt.rot.z * rad2deg));
    }
    set rotation(value) {
        this.#rotationCache.set(value);
        this.alt.rot = new alt.Vector3(value).toRadians();
    }

    get heading() {
        return this.rotation.z;
    }

    set heading(value) {
        this.rotation = new mp.Vector3(this.rotation.x, this.rotation.y, value);
    }
}
