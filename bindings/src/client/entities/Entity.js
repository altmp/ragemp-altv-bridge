import * as alt from 'alt-client';
import { _WorldObject } from './WorldObject';

export class _Entity extends _WorldObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
    }

    getStreamVariable(key) {
        return this.#alt.getStreamSyncedMeta(key);
    }
}