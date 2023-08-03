import alt from 'alt-shared';
import mp from './mp';
import { BaseEvents } from './BaseEvents';
import {emitInternal, internalName} from './utils';
import {emitAllClientsInternal, emitClientInternal} from '../server/serverUtils';

class DefaultChat {
    constructor() {

        this.enabled = true;

        if(alt.isServer) {
            alt.onClient(internalName('onchat'), (player, msg) => this.handleServer(player, msg));
        } else {
            alt.on(internalName('onchat'), msg => this.handleClient(msg));
        }
    }

    handleServer(player, msg) {

        if(msg[0] == '/') {
            mp.events.dispatchLocal('playerCommand', player.mp, msg.substring(1));

            msg = msg.trim().slice(1);

            if (msg.length > 0) {
                let args = msg.split(' ');
                let cmd = args.shift();

                emitInternal('cmd', cmd, player, args.join(' '), ...args);
            }
        }
        else {
            mp.events.dispatchLocal('playerChat', player.mp, msg);
        }
    }

    handleClient(msg) {
        if(msg[0] == '/') mp.events.dispatchLocal('playerCommand', msg.substring(1));
        else mp.events.dispatchLocal('playerChat', msg);
    }

    send(player, msg) {
        emitClientInternal(player, 'tochat', null, msg);
    }

    broadcast(msg) {
        emitAllClientsInternal('tochat', null, msg);
    }

    push(msg) {
        emitInternal('tochat', null, msg);
    }

    activate(toggle) {
        this.enabled = toggle;
    }
}

export const InternalChat = new DefaultChat();
