import * as natives from 'natives';
import * as alt from 'alt-client';
import mp from '../shared/mp.js';

// #region Namespaces

mp.game.gameplay = mp.game.misc;
mp.game.ai = mp.game.task;
mp.game.time = mp.game.clock;
mp.game.rope = mp.game.physics;
mp.game.controls = mp.game.pad;
mp.game.ui = mp.game.hud;
mp.gui = {};

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

mp.game.misc.getHashKey = joaat;
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
mp.game.system.vdist = vdist;
mp.game.system.vdist2 = vdist2;
mp.game.misc.getDistanceBetweenCoords = (x1, y1, z1, x2, y2, z2, useZ) => {
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

mp.game.waitAsync = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms || 0));
}

mp.game.wait = (ms) => {
    throw new Error('mp.game.wait is not supported');
}
// TODO: screenshot API

mp.gui.isGpuRenderingEnabled = () => false;

mp.game.graphics.notify = (message) => {
    natives.beginTextCommandThefeedPost('STRING')
    natives.addTextComponentSubstringPlayerName(message)
    natives.endTextCommandThefeedPostMessagetextTu('', '', false, 0, '', '', 1)
    return natives.endTextCommandThefeedPostTicker(false, true)
}

//#region Renamed natives

mp.game.audio.playSoundHash = mp.game.audio.playSound;
mp.game.cam.setTimeIdleDrop = mp.game.cam.unk._0x9DFE13ECDC1EC196;
mp.game.cam.resetClockTime = () => natives.setClockTime(12, 0, 0);
// TODO: setLightsState, resetLightsState, getLightsState

mp.game.graphics.screen2dToWorld3d = (pos) => {
    return alt.screenToWorld(pos);
}

mp.game.graphics.world3dToScreen2d = (pos) => {
    return alt.worldToScreen(pos);
}
mp.game.graphics.drawScaleformMovie3dNonAdditive = mp.game.graphics.drawScaleformMovie3DSolid;

mp.game.graphics.drawText3d = mp.game.graphics.drawText = (text, pos, data = {}) => {
    alt.Utils.drawText3dThisFrame(text, pos, data.font, data.scale, data.color ? new alt.RGBA(data.color) : undefined, data.outline, false);
}

mp.game.graphics.setParticleFxBloodScale = mp.game.graphics.unk._0x908311265D42A820;
mp.game.graphics.set2dLayer = mp.game.graphics.setScriptGfxDrawOrder;
mp.game.graphics.drawScaleformMovie3d = mp.game.graphics.drawScaleformMovie3D;
mp.game.graphics.drawDebugText2d = mp.game.graphics.drawDebugText2D;


//#endregion
