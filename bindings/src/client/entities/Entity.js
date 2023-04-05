import * as alt from 'alt-client';
import { _WorldObject } from './WorldObject';
import mp from '../../shared/mp.js';

export class _Entity extends _WorldObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
    }

    getStreamVariable(key) {
        return this.#alt.getStreamSyncedMeta(key); // TODO: convert result
    }
}

mp.entity = _Entity;