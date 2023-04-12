import mp from '../../shared/mp.js';
import * as alt from 'alt-server';

Object.defineProperty(mp, 'config', {
    get: () => alt.getServerConfig()
});
