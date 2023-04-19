import mp from '../shared/mp.js';
import './pools/index.js';
import '../shared/index.js';
import './statics/Events.js';
import './entities/index.js';
import './statics/index.js';
import alt from 'alt-server';

globalThis.mp = mp;

mp.joaat = (model) => alt.hash(model);
mp.init = () => {
    mp._main = true;
};

mp._main = true;
