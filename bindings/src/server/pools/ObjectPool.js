import alt from 'alt-server';
import { ServerPool } from './ServerPool.js';

export class ObjectPool extends ServerPool {
    exists(object) {
        if (object == null) return false;

        if (typeof object === 'object') {
            if (object.alt?.type === alt.BaseObjectType.Object) {
                return object.alt.valid;
            }
            return false;
        }

        return super.exists(object);
    }
}
