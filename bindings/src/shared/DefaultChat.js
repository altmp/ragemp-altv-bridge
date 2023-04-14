import alt from 'alt-shared'
import mp from './mp';
import { BaseEvents } from './BaseEvents';

class DefaultChat extends BaseEvents {
    constructor() {
        super();

        this.enabled = true;

        if(alt.isServer) {
            alt.onClient(mp.prefix + 'onchat', (player, msg) => this.handleServer(player, msg));
        } else {
            alt.on(mp.prefix + 'onchat', msg => this.handleClient(msg));
        }
    }

    handleServer(player, msg) {
        if(!this.enabled) return;

        if(msg[0] == '/') {
            mp.events.dispatch('playerCommand', player.mp, msg);

            msg = msg.trim().slice(1);

            if (msg.length > 0) {
                let args = msg.split(' ');
                let cmd = args.shift();

                this.dispatch(cmd, player, ...args);
            }
        }
        else {
            mp.events.dispatch('playerChat', player.mp, msg);
        }
    }

    handleClient(msg) {
        if(!this.enabled) return;

        if(msg[0] == '/') mp.events.dispatch('playerCommand', msg);
        else mp.events.dispatch('playerChat', msg);
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