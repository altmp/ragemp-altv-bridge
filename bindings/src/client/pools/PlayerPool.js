import alt from 'alt-client';
import { ClientPool } from './ClientPool.js';

export class PlayerPool extends ClientPool {

    exists(player) {
        if (player == null) return false;

        if (typeof player === 'object') {
            if (player.alt?.type === alt.BaseObjectType.Player) return player.alt.valid;
            return false;
        }

        return super.exists(player);
    }
}
