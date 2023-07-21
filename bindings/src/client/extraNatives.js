import * as natives from 'natives';
import * as alt from 'alt-client';
import mp from '../shared/mp.js';
import {drawText2d, drawText3d} from './clientUtils';

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
    return mp.players.atHandle(scriptID) ?? mp.vehicles.atHandle(scriptID) ?? mp.objects.atHandle(scriptID) ?? scriptID;
};
// #region JOAAT

function joaat(key) {
    if (Array.isArray(key)) {
        return key.map(joaat);
    }

    if (typeof key == 'number') return key;
    if (typeof key != 'string') return 0;

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
    const camPos = alt.getCamPos();
    return new mp.Vector3(alt.screenToWorld(Array.isArray(pos) ? new alt.Vector3(pos[0], pos[1], 0) : pos).sub(camPos).normalize().mul(10).add(camPos));
};

mp.game.graphics.world3dToScreen2d = (pos) => {
    const res = alt.getScreenResolution();
    const screenPos = alt.worldToScreen(pos);
    return new mp.Vector3(screenPos.x / res.x, screenPos.y / res.y, 0);
};
mp.game.graphics.drawScaleformMovie3dNonAdditive = mp.game.graphics.drawScaleformMovie3DSolid;

mp.game.graphics.drawText3d = mp.game.graphics.drawText = (text, pos, data = {}) => {
    text = text.replaceAll('\n', '~n~');
    (pos[2] != null ? drawText3d : drawText2d)(text, { x: pos[0], y: pos[1], z: pos[2] }, data.font, data.scale, data.color ? new alt.RGBA(data.color) : undefined, data.outline, false);
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
        return alt.getConfigFlag('FORCE_RENDER_SNOW');
    },
    set(value) {
        alt.setConfigFlag('FORCE_RENDER_SNOW', value);
    }
});

Object.defineProperty(mp.game.weapon, 'unequipEmptyWeapons', {
    get() {
        return !alt.getConfigFlag('DISABLE_AUTO_WEAPON_SWAP');
    },
    set(value) {
        alt.setConfigFlag('DISABLE_AUTO_WEAPON_SWAP', !value);
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

mp.game.hud.setMinimapComponentValues = (name, alignX, alignY, posX, posY, sizeX, sizeY) => {
    alt.setMinimapComponentPosition(name, alignX, alignY, posX, posY, sizeX, sizeY);
};

mp.game.hud.resetMinimapComponentValues = (name) => {
    alt.resetMinimapComponentPosition(name);
};

// TODO: remove after fixed in core
mp.game.shapetest ??= {};
mp.game.shapetest.releaseScriptGuidFromEntity = () => {};

/**
 * @param name {string}
 * @param fn {function(import('alt-client').Blip, ...[*])}
 */
function patchBlipNative(name, fn) {
    const orig = mp.game.hud[name];
    mp.game.hud[name] = function (handle, ...args) {
        const blip = this?.isMpWrapper ? this.alt : (handle >= 0 ? alt.Blip.getByScriptID(handle) : alt.Blip.getByID(-handle));
        if (blip) {
            return fn(blip, ...args);
        }

        console.log('Cannot find blip ' + handle);
        return orig(handle, ...args);
    };
}

patchBlipNative('setBlipNameFromTextFile', (blip, gxt) => {
    if (!blip.isRemote) {
        blip.name = mp.game.gxt.get(gxt);
    } else {
        if (blip.isStreamedIn) {
            natives.setBlipNameFromTextFile(blip.scriptID, gxt);
        } else {
            blip.mp._nextName = gxt;
        }
    }
});

patchBlipNative('setBlipNameToPlayerName', (blip, player) => {
    blip.name = natives.getPlayerName(player);
});

patchBlipNative('setBlipRoute', (blip, enabled) => {
    blip.route = enabled;
});

const blipRouteColors = {'0':[255,255,255,255],'1':[224,50,50,255],'2':[114,204,114,255],'3':[93,182,229,255],'4':[240,240,240,255],'5':[240,200,80,255],'6':[194,80,80,255],'7':[156,110,175,255],'8':[255,123,196,255],'9':[247,159,123,255],'10':[178,144,132,255],'11':[141,206,167,255],'12':[113,169,175,255],'13':[211,209,231,255],'14':[144,127,153,255],'15':[106,196,191,255],'16':[214,196,153,255],'17':[234,142,80,255],'18':[152,203,234,255],'19':[178,98,135,255],'20':[144,142,122,255],'21':[166,117,94,255],'22':[175,168,168,255],'23':[232,142,155,255],'24':[187,214,91,255],'25':[12,123,86,255],'26':[123,196,255,255],'27':[171,60,230,255],'28':[206,169,13,255],'29':[71,99,173,255],'30':[42,166,185,255],'31':[186,157,125,255],'32':[201,225,255,255],'33':[240,240,150,255],'34':[237,140,161,255],'35':[249,138,138,255],'36':[252,239,166,255],'37':[240,240,240,255],'38':[45,110,185,255],'39':[154,154,154,255],'40':[77,77,77,255],'41':[240,153,153,255],'42':[203,54,148,255],'43':[171,237,171,255],'44':[255,163,87,255],'45':[240,240,240,255],'46':[235,239,30,255],'47':[255,149,14,255],'48':[246,60,161,255],'49':[224,50,50,255],'50':[132,102,226,255],'51':[255,133,85,255],'52':[57,102,57,255],'53':[174,219,242,255],'54':[47,92,115,255],'55':[155,155,155,255],'56':[126,107,41,255],'57':[93,182,229,255],'58':[67,57,111,255],'59':[224,50,50,255],'60':[240,200,80,255],'61':[203,54,148,255],'62':[205,205,205,255],'63':[29,100,153,255],'64':[214,116,15,255],'65':[135,125,142,255],'66':[240,200,80,255],'67':[93,182,229,255],'68':[93,182,229,255],'69':[114,204,114,255],'70':[240,200,80,255],'71':[240,200,80,255],'72':[0,0,0,72],'73':[240,200,80,255],'74':[93,182,229,255],'75':[224,50,50,255],'76':[112,25,25,255],'77':[93,182,229,255],'78':[47,92,115,255],'79':[112,25,25,100],'80':[47,92,115,100],'81':[240,160,0,255],'82':[159,201,166,255],'83':[164,76,242,255],'84':[0,0,255,255],'85':[0,0,0,85]};

patchBlipNative('setBlipRouteColour', (blip, color) => {
    blip.routeColor = new alt.RGBA(blipRouteColors[color] ?? [255, 255, 255, 255]);
});

patchBlipNative('setBlipCoords', (blip, posX, posY, posZ) => {
    blip.pos = new alt.Vector3(posX, posY, posZ);
});

patchBlipNative('getBlipCoords', (blip) => {
    return blip.pos;
});

patchBlipNative('setBlipSprite', (blip, spriteId) => {
    blip.sprite = spriteId;
});

patchBlipNative('getBlipSprite', (blip) => {
    return blip.sprite;
});

patchBlipNative('setBlipAlpha', (blip, alpha) => {
    blip.alpha = alpha;
});

patchBlipNative('getBlipAlpha', (blip) => {
    return blip.alpha;
});

patchBlipNative('setBlipFade', (blip, opacity, duration) => {
    blip.fade(opacity, duration);
});

patchBlipNative('setBlipRotation', (blip, rotation) => {
    blip.heading = rotation;
});

patchBlipNative('getBlipRotation', (blip) => {
    return blip.heading;
});

patchBlipNative('setBlipSquaredRotation', (blip, heading) => {
    blip.heading = heading;
});

patchBlipNative('setBlipFlashTimer', (blip, duration) => {
    blip.flashTimer = duration;
});

patchBlipNative('setBlipFlashInterval', (blip, interval) => {
    blip.flashInterval = interval;
});

patchBlipNative('setBlipColour', (blip, color) => {
    blip.color = color;
});

patchBlipNative('getBlipColour', (blip) => {
    return blip.color;
});

patchBlipNative('getBlipHudColour', (blip) => {
    return blip.color;
});

patchBlipNative('setBlipSecondaryColour', (blip, r, g, b) => {
    blip.secondaryColor = new alt.RGBA(r, g, b, 255);
});

patchBlipNative('setBlipHiddenOnLegend', (blip, hidden) => {
    // blip.hidden = hidden;
    // TODO
});

patchBlipNative('setBlipHighDetail', (blip, enabled) => {
    blip.highDetail = enabled;
});

patchBlipNative('setBlipAsMissionCreatorBlip', (blip, enabled) => {
    blip.asMissionCreator = enabled;
});

patchBlipNative('isMissionCreatorBlip', (blip) => {
    return blip.asMissionCreator;
});

patchBlipNative('setBlipFlashes', (blip, enabled) => {
    blip.flashes = enabled;
});

patchBlipNative('isBlipFlashing', (blip) => {
    return blip.flashes;
});

patchBlipNative('setBlipFlashesAlternate', (blip, enabled) => {
    blip.flashesAlternate = enabled;
});

patchBlipNative('setBlipAsShortRange', (blip, enabled) => {
    blip.shortRange = enabled;
});

patchBlipNative('isBlipShortRange', (blip) => {
    return blip.shortRange;
});

patchBlipNative('setBlipScale', (blip, scale) => {
    blip.scale = scale;
});

patchBlipNative('setBlipScaleTransformation', (blip, xScale, yScale) => {
    blip.size = new alt.Vector2(xScale, yScale);
});

patchBlipNative('setBlipPriority', (blip, priority) => {
    blip.priority = priority;
});

patchBlipNative('setBlipDisplay', (blip, displayId) => {
    blip.display = displayId;
});

patchBlipNative('setBlipCategory', (blip, category) => {
    blip.category = category;
});

patchBlipNative('setBlipAsFriendly', (blip, enabled) => {
    // TODO
    // blip.friendIndicatorVisible = enabled;
});

patchBlipNative('showTickOnBlip', (blip, enabled) => {
    blip.tickVisible = enabled;
});

patchBlipNative('showOutlineIndicatorOnBlip', (blip, enabled) => {
    blip.outlineIndicatorVisible = enabled;
});

patchBlipNative('showFriendIndicatorOnBlip', (blip, enabled) => {
    blip.friendIndicatorVisible = enabled;
});

patchBlipNative('showCrewIndicatorOnBlip', (blip, enabled) => {
    blip.crewIndicatorVisible = enabled;
});

patchBlipNative('setBlipDisplayIndicatorOnBlip', (blip, enabled) => {
    // TODO
});

patchBlipNative('setBlipAsMinimalOnEdge', (blip, enabled) => {
    blip.shrinked = enabled;
});

patchBlipNative('setBlipBright', (blip, enabled) => {
    blip.bright = enabled;
});

patchBlipNative('setBlipShowCone', (blip, enabled) => {
    blip.showCone = enabled;
});

mp.game.gameplay.getModelDimensions = (model) => {
    const [, min, max] = natives.getModelDimensions(model);
    return {
        min: new mp.Vector3(min),
        max: new mp.Vector3(max),
        minimum: new mp.Vector3(min),
        maximum: new mp.Vector3(max)
    };
};
//#endregion

mp.game2.entity.setCoords = function (entity, xPos, yPos, zPos, xAxis, yAxis, zAxis, clearArea) {
    const ent = alt.LocalVehicle.getByScriptID(entity);
    if (ent && ent.valid) {
        ent.pos = new alt.Vector3(xPos, yPos, zPos);
        return;
    }

    natives.setEntityCoords(entity, xPos, yPos, zPos, xAxis, yAxis, zAxis, clearArea);
};

mp.game2.entity.setCoordsNoOffset = function (entity, xPos, yPos, zPos, xAxis, yAxis, zAxis) {
    const ent = alt.LocalVehicle.getByScriptID(entity);
    if (ent && ent.valid) {
        ent.pos = new alt.Vector3(xPos, yPos, zPos);
        return;
    }

    natives.setEntityCoordsNoOffset(entity, xPos, yPos, zPos, xAxis, yAxis, zAxis);
};

mp.game2.entity.setCoordsWithoutPlantsReset = function (entity, xPos, yPos, zPos, alive, deadFlag, ragdollFlag, clearArea) {
    const ent = alt.LocalVehicle.getByScriptID(entity);
    if (ent && ent.valid) {
        ent.pos = new alt.Vector3(xPos, yPos, zPos);
        return;
    }

    natives.setEntityCoordsWithoutPlantsReset(entity, xPos, yPos, zPos, alive, deadFlag, ragdollFlag, clearArea);
};
