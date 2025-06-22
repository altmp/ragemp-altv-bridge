import alt from 'alt-client';
import { ClientPool } from './ClientPool.js';

export class VehiclePool extends ClientPool {
    exists(vehicle) {
        if (vehicle == null) return false;

        if (typeof vehicle === 'object') {
            if (vehicle.alt?.type === alt.BaseObjectType.Vehicle || vehicle.alt?.type === alt.BaseObjectType.LocalVehicle) {
                return vehicle.alt.valid;
            }
            return false;
        }

        return super.exists(vehicle);
    }
}
