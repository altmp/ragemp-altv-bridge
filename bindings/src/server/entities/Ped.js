import * as alt from 'alt-server';
import mp from '../../shared/mp.js';
import { deg2rad } from '../../shared/utils.js';
import { _Entity } from './Entity.js';
import { Pool } from '../pools/Pool';

export class _Ped extends _Entity {
    alt;

    /** @param {alt.Ped} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get controller() {
        return this.alt.netOwner;
    }
}

Object.defineProperty(alt.Ped.prototype, 'mp', { 
    get() {
        return this._mp ??= new _Ped(this);
    } 
});

mp.Ped = _Ped;

mp.peds = new Pool(() => alt.Ped.all, alt.Ped.getByID);

mp.peds.new = function(model, position, heading, dimension) {
    const ped = new alt.Ped(model, position, new alt.Vector3(0, 0, heading * deg2rad));
    ped.dimension = dimension;
    return ped.mp;
}