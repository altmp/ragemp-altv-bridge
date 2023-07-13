import alt from 'alt-shared';
import mp from './mp';
import { BaseEvents } from './BaseEvents';

class DefaultChat {
    constructor() {

        this.enabled = true;

        if(alt.isServer) {
            alt.onClient(mp.prefix + 'onchat', (player, msg) => this.handleServer(player, msg));
        } else {
            alt.on(mp.prefix + 'onchat', msg => this.handleClient(msg));
        }
    }

    handleServer(player, msg) {

        if(msg[0] == '/') {
            mp.events.dispatchLocal('playerCommand', player.mp, msg.substring(1));

            msg = msg.trim().slice(1);

            if (msg.length > 0) {
                let args = msg.split(' ');
                let cmd = args.shift();

                alt.emit(mp.prefix + 'cmd', cmd, player, args.join(' '), ...args);
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
        alt.emitClient(player, mp.prefix + 'tochat', null, msg);
    }

    broadcast(msg) {
        alt.emitAllClients(mp.prefix + 'tochat', null, msg);
    }

    push(msg) {
        alt.emit(mp.prefix + 'tochat', null, msg);
    }

    activate(toggle) {
        this.enabled = toggle;
    }
}

export const InternalChat = new DefaultChat();
