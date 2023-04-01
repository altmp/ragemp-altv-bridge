import * as natives from 'natives';
import mp from '../shared/mp.js';

// #region Namespaces

mp.game2.gameplay = mp.game2.misc;
mp.game2.ai = mp.game2.task;
mp.game2.time = mp.game2.clock;
mp.game2.rope = mp.game2.physics;
mp.game2.controls = mp.game2.pad;
mp.game2.ui = mp.game2.hud;

// #endregion

// #region JOAAT

function joaat(key) {
    if (Array.isArray(key)) {
        return key.map(joaat);
    }

    const keyLowered = key.toLowerCase();
    const length = keyLowered.length;
    let hash, i;

    for (hash = i = 0; i < length; i++) {
        hash += keyLowered.charCodeAt(i);
        hash += (hash << 10);
        hash ^= (hash >>> 6);
    }

    hash += (hash << 3);
    hash ^= (hash >>> 11);
    hash += (hash << 15);

    return hash >>> 0;
}

mp.game2.misc.getHashKey = joaat;
mp.game.joaat = joaat;

// #endregion

// #region Distance
function vdist(x1, y1, z1, x2, y2, z2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dz = z1 - z2;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function vdist2(x1, y1, z1, x2, y2, z2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dz = z1 - z2;
    return (dx * dx + dy * dy + dz * dz);
}
mp.game2.system.vdist = vdist;
mp.game2.system.vdist2 = vdist2;
mp.game2.misc.getDistanceBetweenCoords = (x1, y1, z1, x2, y2, z2, useZ) => {
    if (useZ) return vdist(x1, y1, z1, x2, y2, z2);
    else return vdist(x1, y1, 0, x2, y2, 0);
};
// #endregion

// #region disableControlActionBatch

// This is a temporary implementation
// TODO: Implement natively in core

let disabledActionsMoveLook = [];
let disabledActionsFrontend = [];

mp.game.controls.setDisableControlActionBatch = function(isMoveOrLookInputGroup, controlActions) {
    if (isMoveOrLookInputGroup) disabledActionsMoveLook = controlActions;
    else disabledActionsFrontend = controlActions;
};

mp.game.controls.applyDisableControlActionBatch = function() {
    for (const action of disabledActionsMoveLook) natives.disableControlAction(0, action, false);
    for (const action of disabledActionsFrontend) natives.disableControlAction(2, action, false);
};

// #endregion

mp.gui.execute = () => {}; // seems to be doing nothing

// TODO: screenshot API

mp.gui.isGpuRenderingEnabled = () => false;