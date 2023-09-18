import * as alt from 'alt-client';
import { _WorldObject } from './WorldObject';
import mp from '../../shared/mp.js';
import {toMp} from '../../shared/utils';
import natives from 'natives';

export class _Entity extends _WorldObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
    }

    getStreamVariable(key) {
        if (!this.hasStreamVariable(key)) return undefined;
        return toMp(this.#alt.getStreamSyncedMeta(key));
    }

    hasStreamVariable(key) {
        return this.#alt.hasStreamSyncedMeta(key);
    }

    get isPositionFrozen() {
        return this.#alt.frozen;
    }
}

mp.entity = _Entity;
