import * as natives from 'natives';
import * as alt from 'alt-client';
import mp from '../shared/mp.js';

// #region Namespaces

mp.game1 = mp.game;
mp.game.gameplay = mp.game.misc;
mp.game.ai = mp.game.task;
mp.game.time = mp.game.clock;
mp.game.rope = mp.game.physics;
mp.game.controls = mp.game.pad;
mp.game.ui = mp.game.hud;
mp.game.decisionevent = mp.game.event;
mp.gui = {};

// #endregion

mp._findEntity = (scriptID) => {
    if (typeof scriptID != 'number') return scriptID;
    // TODO: optimize objects scriptid stuff
    return alt.Player.getByScriptID(scriptID)?.mp ?? alt.Vehicle.getByScriptID(scriptID)?.mp ?? alt.Object.getByScriptID(scriptID)?.mp ?? alt.Object.allWorld.find(e => e.scriptID === scriptID)?.mp ?? scriptID;
};
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

//#region setShowHudComponentsThisFrameBatch
let hideHudComponents = [];
let showHudComponents = [];

mp.game.hud.setShowHudComponentsThisFrameBatch = function(isShow, components) {
    if (isShow) showHudComponents = components;
    else hideHudComponents = components;
};

mp.game.hud.applyShowHudComponentsThisFrameBatch = function() {
    for (const component of showHudComponents) natives.showHudComponentThisFrame(component);
    for (const component of hideHudComponents) natives.hideHudComponentThisFrame(component);
};
//#endregion

mp.gui.execute = () => {}; // seems to be doing nothing

mp.game.waitAsync = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms || 0));
};

mp.game.wait = (ms) => {
    throw new Error('mp.game.wait is not supported');
};
// TODO: screenshot API

mp.gui.isGpuRenderingEnabled = () => false;

mp.game.graphics.notify = (message) => {
    natives.beginTextCommandThefeedPost('STRING');
    natives.addTextComponentSubstringPlayerName(message);
    return natives.endTextCommandThefeedPostTicker(false, true);
};

//#region Renamed natives

mp.game.audio.playSoundHash = mp.game.audio.playSound;
mp.game.cam.setTimeIdleDrop = mp.game.cam.unk._0x9DFE13ECDC1EC196;
mp.game.cam.resetClockTime = () => natives.setClockTime(12, 0, 0);
mp.game.time.resetClockTime = () => natives.setClockTime(12, 0, 0);
// TODO: setLightsState, resetLightsState, getLightsState

mp.game.graphics.screen2dToWorld3d = (pos) => {
    return alt.screenToWorld(pos);
};

mp.game.graphics.world3dToScreen2d = (pos) => {
    return alt.worldToScreen(pos);
};
mp.game.graphics.drawScaleformMovie3dNonAdditive = mp.game.graphics.drawScaleformMovie3DSolid;

mp.game.graphics.drawText3d = mp.game.graphics.drawText = (text, pos, data = {}) => {
    alt.Utils.drawText3dThisFrame(text, pos, data.font, data.scale, data.color ? new alt.RGBA(data.color) : undefined, data.outline, false);
};

mp.game.graphics.setParticleFxBloodScale = mp.game.graphics.unk._0x908311265D42A820;
mp.game.graphics.set2dLayer = mp.game.graphics.setScriptGfxDrawOrder;
mp.game.graphics.drawScaleformMovie3d = mp.game.graphics.drawScaleformMovie3D;
mp.game.graphics.drawDebugText2d = mp.game.graphics.drawDebugText2D;
mp.game.hud.enableDeathbloodSeethrough = mp.game.hud.unk._0x4895BDEA16E7C080;
mp.game.hud.endTextComponent = mp.game.graphics.endTextCommandScaleformString;
// TODO: getGravityLevel
mp.game.misc.getAngleBetween2dVectors = mp.game.misc.getAngleBetween2DVectors;
mp.game.gameplay.getAngleBetween2dVectors = mp.game.misc.getAngleBetween2DVectors;
mp.game.misc.getHeadingFromVector2d = mp.game.misc.getHeadingFromVector2D;
mp.game.gameplay.getHeadingFromVector2d = mp.game.misc.getHeadingFromVector2D;
mp.game.misc.getGroundZFor3dCoord = mp.game.misc.getGroundZFor3DCoord;
mp.game.gameplay.getGroundZFor3dCoord = mp.game.misc.getGroundZFor3DCoord;
mp.game.player.getEntityIsFreeAimingAt = () => {
    const res = mp.game.player.getEntityIsFreeAimingAtRaw();
    if (!res) return res;
    return mp._findEntity(res);
};
// TODO: mp.game.object.getAllByHash
// TODO: mp.game.object.getAllInRange
// TODO: minimap components

mp.game.pathfind.loadAllPathNodes = (set) => natives.loadAllPathNodes(set);
mp.game.ped.isCopInArea3d = mp.game.ped.isCopInArea3D;
mp.game.ped.setTimeExclusiveDisplayTexture = mp.game.ped.unk._0xFD325494792302D7;
mp.game.player.intToindex = mp.game.player.intToIndex;
mp.game.player.setAreasGeneratorOrientation = mp.game.player.unk._0xC3376F42B1FACCC6;
mp.game.player.setAreasGeneratorOrientation = mp.game.player.unk._0xC3376F42B1FACCC6;
mp.game.player.setAirDragMultiplierForsVehicle = mp.game.player.setAirDragMultiplierForPlayersVehicle;
mp.game.player.setHudAnimStopLevel = mp.game.player.unk._0xDE45D1A1EF45EE61;
mp.game.player.setHudAnimStopLevel = mp.game.player.unk._0xDE45D1A1EF45EE61;
mp.game.player.hasTeleportFinished = mp.game.player.updateTeleport;
// TODO: mp.streaming.getAllModelNames
// TODO: mp.streaming.getAllModelHashes
// TODO: mp.streaming.getModelNameFromHash
// TODO: mp.streaming.forceStreamingUpdate

mp.game.vehicle.setExperimentalAttachmentSyncEnabled = () => {};
mp.game.vehicle.setExperimentalHornSyncEnabled = () => {};
// TODO: mp.vehicle.addModelOverride
// TODO: mp.vehicle.removeModelOverride
// TODO: mp.vehicle.clearModelOverrides
// TODO: mp.game.weapon.getWeaponInfo <- idk how this shit is supposed to work on RAGE:MP, looks like it just doesn't /shrug
// TODO: mp.game.weapon.getAccuracyModifier <- same story
// TODO: mp.game.weapon.getAllWeaponNames

// TODO: dlc1, dlc2

mp.game.unk = {};
mp.game.unk.getBroadcastFinshedLosSound = mp.game.loadingscreen.getBroadcastFinshedLosSound;

mp.game.recorder = {};
mp.game.recorder.start = mp.game.recording.start;
mp.game.recorder.isRecording = mp.game.recording.isRecording;
mp.game.recorder.stop = mp.game.recording.stopAndSaveClip;
mp.game.recorder.isRecording = mp.game.recording.isRecording;

mp.game.weapon.cancelCurrentDamageEvent = () => {
    // TODO?
};

mp.game.weapon.setCurrentDamageEventAmount = () => {
    // TODO?
};

mp.game.weapon.setCurrentDamageEventCritical = () => {
    // TODO?
};

mp.game.vehicle.isCopVehicleInArea3d = mp.game.vehicle.isCopInArea3D;

mp.game.graphics.setLightsState = function() {
    // TODO
};

mp.game.weapon.setEnableLocalOutgoingDamage = function () {
    // TODO
};

mp.game.gxt = {};

mp.game.gxt.get = function (key) {
    if (typeof key != 'string') key = String(key);
    return alt.getGxtText(key) || natives.getFilenameForAudioConversation(key);
};

mp.game.gxt.getDefault = function (key) {
    if (typeof key != 'string') key = String(key);
    // TODO: implement in core
    const oldValue = alt.getGxtText(key);
    if (oldValue) alt.removeGxtText(key);
    const newValue = natives.getFilenameForAudioConversation(key);
    if (oldValue) alt.addGxtText(key, oldValue);
    return newValue;
};

const keys = new Set;
mp.game.gxt.set = function (key, value) {
    if (typeof key != 'string') key = String(key);
    alt.addGxtText(key, value);
    keys.add(key);
};

mp.game.gxt.reset = function() {
    for (const key of keys) {
        alt.removeGxtText(key);
    }
    keys.clear();
};

Object.defineProperty(mp.game.gameplay, 'enableSnow', {
    get() {
        return false;
    },
    set(value) {
        // TODO: enableSnow
    }
});

mp.game.hud.getCurrentStreetNameString = () => {
    const pos = alt.Player.local.pos;
    const [, key] = natives.getStreetNameAtCoord(pos.x, pos.y, pos.z, 0, 0);
    return natives.getStreetNameFromHashKey(key);
};

mp.game.hud.getCurrentStreetNameHash = () => {
    const pos = alt.Player.local.pos;
    const [, key] = natives.getStreetNameAtCoord(pos.x, pos.y, pos.z, 0, 0);
    return key;
};

mp.game.hud.getCurrentAreaNameString = () => {
    const pos = alt.Player.local.pos;
    const key = natives.getNameOfZone(pos.x, pos.y, pos.z);
    return natives.getFilenameForAudioConversation(key);
};

mp.game.hud.getCurrentAreaNameLabel = () => {
    const pos = alt.Player.local.pos;
    return natives.getNameOfZone(pos.x, pos.y, pos.z);
};

mp.game.hud.getCurrentAreaNameHash = () => {
    const pos = alt.Player.local.pos;
    return natives.getHashOfMapAreaAtCoords(pos.x, pos.y, pos.z);
};

//#endregion
