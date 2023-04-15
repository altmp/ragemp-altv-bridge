import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { Pool } from '../Pool.js';
import { _BaseObject } from './BaseObject.js';

export class _Ped extends _BaseObject {
    /** @param {alt.Checkpoint} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    getVariable() {
        return null;
    }

    setVariable() {

    }

    setVariables() {

    }

    hasVariable() {
        return false;
    }
}

mp.Ped = _Ped;

mp.peds = new Pool(() => [], () => [], (id) => null);

mp.peds.new = function(type, pos, radius, options) {
    return new _Ped({});
}
