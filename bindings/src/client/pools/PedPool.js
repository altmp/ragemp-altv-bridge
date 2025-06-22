import alt from 'alt-client';
import { ClientPool } from './ClientPool.js';

export class PedPool extends ClientPool {
    exists(ped) {
        if (ped == null) return false;

        if (typeof ped === 'object') {
            if (ped.alt?.type === alt.BaseObjectType.Ped) return ped.alt.valid;
            return false;
        }

        return super.exists(ped);
    }
}
