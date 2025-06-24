import alt from 'alt-server';
import { ServerPool } from './ServerPool.js';

export class PedPool extends ServerPool {
    exists(ped) {
        if (ped == null) return false;

        if (typeof ped === 'object') {
            if (ped.alt instanceof alt.Ped) {
                return ped.alt.valid;
            }
            return false;
        }

        return super.exists(ped);
    }
}
