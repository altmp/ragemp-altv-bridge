import * as alt from 'alt-server';
import mp from '../../shared/mp.js';
import {mpDimensionToAlt, deg2rad, hashIfNeeded} from '../../shared/utils.js';
import { _Entity } from './Entity.js';
import { ServerPool } from '../pools/ServerPool';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';

export class _Ped extends _Entity {
    alt;

    /** @param {alt.Ped} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    type = 'ped';
}

Object.defineProperty(alt.Ped.prototype, 'mp', {
    get() {
        return this._mp ??= new _Ped(this);
    }
});

mp.Ped = _Ped;

mp.peds = new ServerPool(EntityGetterView.fromClass(alt.Ped));

mp.peds.new = function(model, position, heading, dimension) {
    model = hashIfNeeded(model);
    const ped = new alt.Ped(model, position, new alt.Vector3(0, 0, heading * deg2rad));
    ped.mp.dimension = dimension ?? 0;
    return ped.mp;
};
