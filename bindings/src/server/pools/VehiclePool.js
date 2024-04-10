import alt from 'alt-server';
import { ServerPool } from './ServerPool.js';

export class VehiclePool extends ServerPool {
    exists(vehicle) {
        if (vehicle == null) return false;

        if (typeof vehicle === 'object') {
            if (vehicle.alt instanceof alt.Vehicle) {
                return vehicle.alt.valid;
            }
            return false;
        }

        return super.exists(vehicle);
    }
}
