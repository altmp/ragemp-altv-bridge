import * as alt from 'alt-server';
import mp from '../../shared/mp.js';
import {mpDimensionToAlt, deg2rad, hashIfNeeded, toMp} from '../../shared/utils.js';
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
    lockController = false;
    dynamic = true;

    get frozen() {
        return this.alt.frozen;
    }

    set frozen(value) {
        this.alt.frozen = value;
    }

    get controller() {
        return toMp(this.alt.netOwner);
    }

    set controller(value) {
        this.alt.setNetOwner(value?.alt ?? null, this.lockController);
    }

}

Object.defineProperty(alt.Ped.prototype, 'mp', {
    get() {
        return this._mp ??= new _Ped(this);
    }
});

mp.Ped = _Ped;

mp.peds = new ServerPool(EntityGetterView.fromClass(alt.Ped), [_Ped], 4);

mp.peds.new = function(model, position, params) {
    model = hashIfNeeded(model);
    const ped = new alt.Ped(model, position, new alt.Vector3(0, 0, 0));
    const ent = ped.mp;
    if ('dimension' in params) ent.dimension = params.dimension;
    if ('lockController' in params) ent.lockController = params.lockController;
    if ('frozen' in params) ent.frozen = params.frozen;
    return ped.mp;
};
