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
        return toMp(this.#alt.getStreamSyncedMeta(key));
    }
}

mp.entity = _Entity;
