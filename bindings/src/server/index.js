import mp from '../shared/mp.js';
import alt from 'alt-server';
import {internalName} from '../shared/utils';

mp.streamingDistance = alt.getServerConfig().streamingDistance ?? 300;
mp._disableRawEmits = true;
alt.setSyncedMeta(internalName('streamingDistance'), mp.streamingDistance);

import './pools/index.js';
import '../shared/index.js';
import './statics/Events.js';
import './entities/index.js';
import './statics/index.js';

globalThis.mp = mp;

mp.joaat = (model) => alt.hash(model);
mp.init = () => {
    mp._main = true;
};

mp._main = true;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

// TODO delete after debugging
if (alt.debug && mp._main) {
    alt.on('consoleCommand', async (cmd, ...args) => {
        if (cmd !== 'eval') return;
        console.log(await (new AsyncFunction('alt', 'mp', args.join(' ')))(alt, mp));
    });

    alt.onClient(mp.prefix + 'evalAllPlayers', async (player, code) => {
        alt.emitAllClients(mp.prefix + 'eval', code);
    });

    alt.onClient(mp.prefix + 'evalPlayer', async (_, player, code) => {
        alt.emitClient(player, mp.prefix + 'eval', code);
    });

    alt.setSyncedMeta(internalName('eventSize'), alt.getServerConfig().maxClientScriptEventSize ?? 8192);
}
