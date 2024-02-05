import mp from '../../shared/mp';
import {_WorldObject} from './WorldObject';
import { ClientPool } from '../ClientPool';
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

mp.pickups = new ClientPool(new EntityStoreView(), [_Pickup]);

mp.pickups.new = function() {
    return new _Pickup();
};
