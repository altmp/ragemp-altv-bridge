import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_WorldObject} from './WorldObject';
import { ServerPool } from '../pools/ServerPool';
import {mpDimensionToAlt, toAlt, toMp} from '../../shared/utils';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';

export class _Pickup extends _WorldObject {
    alt;

    /** @param {alt.Colshape} alt */
    constructor(alt) {
        super(alt);
    }

    type = 'pickup';
}

mp.Pickup = _Pickup;

mp.pickups = new ServerPool(new EntityStoreView());

mp.pickups.new = function() {
    return new _Pickup();
};
