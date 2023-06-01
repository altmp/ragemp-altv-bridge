import * as alt from 'alt-server';
import { SyncedMetaProxy } from '../../shared/meta.js';
import mp from '../../shared/mp.js';
import {altSeatToMp, argsToAlt, deg2rad, rad2deg, vdist, vdist2} from '../../shared/utils.js';
import { _Entity } from './Entity.js';
import { PlayerPool } from '../pools/PlayerPool';
import { InternalChat } from '../../shared/DefaultChat.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';

let bannedHwids = {};
const ipRegex = /^::ffff:([0-9.]+)$/;

export class _Player extends _Entity {
    /** @type {alt.Player} alt */
    alt;

    /** @param {alt.Player} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        this.data = new SyncedMetaProxy(alt);
    }

    #ensureHeadblend() {
        if (this.alt.hasMeta(mp.prefix + 'headblendInit')) return;
        this.alt.setHeadBlendData(0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.alt.setMeta(mp.prefix + 'headblendInit', true);
    }

    get serial() {
        return this.alt.hwidHash + this.alt.hwidExHash;
    }

    get socialClub() {
        return this.alt.socialClubName;
    }

    get action() { // TODO: check all the other existing values
        if (this.alt.vehicle) return 'in_vehicle';
        return 'stopped';
    }

    get aimTarget() {
        return this.alt.entityAimingAt?.mp ?? null;
    }

    get allWeapons() {
        return Object.fromEntries(this.alt.weapons.map(e => [e.hash, 0])); // TODO: ammo
    }

    get armour() {
        return this.alt.armour;
    }

    set armour(value) {
        this.alt.armour = value;
    }

    get eyeColor() {
        return this.alt.getEyeColor();
    }

    set eyeColor(value) {
        this.alt.setEyeColor(value);
    }

    get faceFeatures() {
        throw new Error('faceFeatures getter is not supported (does not work on 1.1)');
    }

    get hairColor() {
        return this.alt.getHairColor();
    }

    set hairColor(value) {
        this.alt.setHairColor(value);
    }

    get hairHighlightColor() {
        return this.alt.getHairHighlightColor();
    }

    set hairHighlightColor(value) {
        this.alt.setHairHighlightColor(value);
    }

    get heading() {
        return this.alt.rot.z * rad2deg;
    }

    set heading(value) {
        this.alt.rot = new alt.Vector3(this.alt.rot.x, this.alt.rot.y, value * deg2rad);
    }

    get health() {
        return this.alt.health - 100;
    }

    set health(value) {
        this.alt.health = value + 100;
    }

    get rgscId() {
        return (this.alt.socialID ^ 0x1250AB0A).toString();
    }

    get ip() {
        const match = ipRegex.exec(this.alt.ip);
        if(match) {
            return match[1];
        }
        return this.alt.ip;
    }

    get isAiming() {
        return this.alt.isAiming;
    }

    // TODO: is*

    get name() {
        return this.alt.name;
    }
    set name(value) {
        // TODO
    }

    // TODO: implement it in core
    get packetLoss() {
        return 0;
    }

    get ping() {
        return this.alt.ping;
    }

    get seat() {
        return altSeatToMp(this.alt.seat); // RAGEMP seats start with 0
    }

    get streamedPlayers() {
        return alt.Player.all.filter(p => this.alt.isEntityInStreamRange(p)).map(p => p.mp); // TODO: implement in core
    }

    get vehicle() {
        return this.alt.vehicle?.mp ?? null;
    }

    // TODO: voiceListeners
    get voiceListeners() {
        return [];
    }



    get weapon() {
        return this.alt.currentWeapon;
    }

    get weapons() {
        throw new Error('weapons getter is not supported (does not work on 1.1)');
    }

    get weaponAmmo() {
        return 0; // TODO
    }

    set weaponAmmo(value) {}

    get alpha() {
        return this.alt.getStreamSyncedMeta(mp.prefix + 'alpha');
    }

    set alpha(value) {
        this.alt.setStreamSyncedMeta(mp.prefix + 'alpha', value);
    }

    get model() {
        return this.alt.model;
    }

    set model(value) {
        const oldModel = this.alt.model;
        this.alt.deleteMeta(mp.prefix + 'headblendInit');
        this.alt.model = value;
        mp.events.dispatch('entityModelChange', this, oldModel);
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }

    type = 'player';

    ban(reason = 'You were banned') {
        this.bannedHwids[this.alt.hwidHash + this.alt.hwidExHash] = reason;
    }

    call(evt, args = []) {
        console.log('EMIT CALL', this.alt.id, evt, args);
        this.alt.emit(evt, ...argsToAlt(args));
    }

    callUnreliable(evt, args = []) {
        console.log('EMIT CALL UNRELIABLE', this.alt.id, evt, args);
        (mp._forceReliable ? alt.emitClient : alt.emitClientUnreliable)(this.alt, evt, ...argsToAlt(args));
    }

    callProc(evt, args = []) {
        console.log('EMIT CALL PROCEDURE', this.alt.id, evt, args);
        return mp.events.callRemoteProc(this.alt, evt, ...args);
    }

    hasPendingRpc() {
        return mp.events.hasPendingRpc(this.alt);
    }

    cancelPendingRpc(id) {
        return mp.events.cancelPendingRpc(this.alt, id);
    }

    callToStreamed(includeSelf, evt, args) {
        const altArgs = argsToAlt(args);
        console.log('EMIT CALL TO STREAMED', this.alt.id, evt, args);
        if (includeSelf) this.alt.emitClient(evt, ...altArgs);
        alt.emitClient(alt.Player.all.filter(p => this.alt.isEntityInStreamRange(p)), evt, ...altArgs);
    }

    callToStreamedUnreliable(includeSelf, evt, args) {
        const altArgs = argsToAlt(args);
        console.log('EMIT CALL TO STREAMED', this.alt.id, evt, args);
        if (includeSelf) this.alt.emitClient(evt, ...altArgs);
        (mp._forceReliable ? alt.emitClient : alt.emitClientUnreliable)(alt.Player.all.filter(p => this.alt.isEntityInStreamRange(p)), evt, ...altArgs);
    }

    // TODO: tattoos (decorations)

    getClothes(component) {
        this.#ensureHeadblend();
        return this.alt.getClothes(component);
    }

    getFaceFeature(idx) {
        return this.alt.getFaceFeatureScale(idx);
    }

    getHeadBlend() {
        this.#ensureHeadblend();
        const data = this.alt.getHeadBlendData();
        return {
            shapes: [data.shapeFirstID, data.shapeSecondID, data.shapeThirdID],
            skins: [data.skinFirstID, data.skinSecondID, data.skinThirdID],
            shapeMix: data.shapeMix,
            skinMix: data.skinMix,
            thirdMix: data.thirdMix
        };
    }

    getHeadOverlay(idx) {
        this.#ensureHeadblend();
        const data = this.alt.getHeadOverlay(idx);
        return [data.index, data.opacity, data.colorIndex, data.secondColorIndex];
    }

    getProp(component) {
        return this.alt.getProp(component);
    }

    getWeaponAmmo(weaponHash) {
        return 0; // TODO
    }

    giveWeapon(weapon, ammo) { // TODO: object overload
        if (Array.isArray(weapon)) {
            if (Array.isArray(ammo)) {
                for (let i = 0; i < weapon.length; i++) {
                    this.giveWeapon(weapon[i], ammo[i] ?? 1);
                }
            } else {
                for (const weapon of weapon) {
                    this.giveWeapon(weapon, ammo);
                }
            }
            return;
        }

        this.alt.giveWeapon(weapon, ammo, true); // TODO: is true?
    }

    invoke(native, ...args) {
        this.alt.emit('$invoke', native, ...argsToAlt(args));
    }

    isStreamed(player) {
        return this.alt.isEntityInStreamRange(player.alt);
    }

    isStreamedFor(player) {
        return player.isStreamed(this);
    }

    kick(reason) {
        this.alt.kick(reason);
    }

    kickSilent(reason) {
        // TODO: kickSilent
        this.kick(reason);
    }

    // TODO: playScenario

    playAnimation(dict, name, speed, flag) {
        this.alt.playAnimation(dict, name, speed, speed, -1, flag, 1, false, false, false);
    }

    outputChatBox(message) {
        InternalChat.send(this.alt, message);
    }

    notify(message) {
        alt.emitClientRaw(this.alt, mp.prefix + 'notify', message);
    }

    putIntoVehicle(vehicle, seat) {
        this.alt.setIntoVehicle(vehicle.alt, seat + 1); // Seats in RAGEMP start with 0
    }

    removeFromVehicle() {
        // eslint-disable-next-line no-self-assign
        this.alt.pos = this.alt.pos; // TODO: implement better in core
    }

    removeObject(id) {
        this.alt.clearProp(id);
    }

    removeWeapon(weapon) {
        this.alt.removeWeapon(weapon);
    }

    removeAllWeapons() {
        this.alt.removeAllWeapons();
    }

    setClothes(component, drawable, texture, palette) {
        this.alt.setClothes(component, drawable, texture, palette);
    }

    setCustomization(gender, shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, eyeColor, hairColor, highlightColor, faceFeatures) {
        this.#ensureHeadblend();
        this.alt.removeAllWeapons(); // TODO: is needed?
        // TODO: is model set needed?
        if (gender === true) this.model = alt.hash('mp_m_freemode_01');
        else this.model = alt.hash('mp_f_freemode_01');
        this.alt.setHeadBlendData(shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix);
        this.alt.setEyeColor(eyeColor);
        this.alt.setHairColor(hairColor);
        this.alt.setHairHighlightColor(highlightColor);
        for (let i = 0; i < Math.min(faceFeatures.length, 20); i++) {
            this.alt.setFaceFeature(i, faceFeatures[i]);
        }
    }

    setFaceFeature(idx, scale) {
        this.#ensureHeadblend();
        this.alt.setFaceFeature(idx, scale);
    }

    setHairColor(hairColor) {
        this.#ensureHeadblend();
        this.alt.setHairColor(hairColor);
    }

    setHeadBlend(shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix) {
        this.alt.setHeadBlendData(shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix);
    }

    setHeadOverlay(overlay, params) {
        this.#ensureHeadblend();
        const [index, opacity, firstColor, secondColor] = params;
        this.alt.setHeadOverlay(overlay, index, opacity);

        this.alt.setHeadOverlayColor(overlay, overlay === 5 || overlay === 8 ? 2 : 1, firstColor, secondColor);
    }

    setProp(prop, drawable, texture) {
        this.alt.setProp(prop, drawable, texture);
    }

    setWeaponAmmo(weapon, ammo) {
        // TODO
    }

    spawn(pos) {
        this.alt.spawn(pos);
        mp.events.dispatch('playerSpawn', this);
    }

    stopAnimation() {
        this.alt.clearTasks();
    }

    updateHeadBlend(shape, skin, third) {
        this.#ensureHeadblend();
        const headBlend = this.alt.getHeadBlendData();
        this.alt.setHeadBlendData(headBlend.shapeFirstID, headBlend.shapeSecondID, headBlend.shapeThirdID,
            headBlend.skinFirstID, headBlend.skinSecondID, headBlend.skinThirdID,
            shape, skin, third);
    }

    enableVoiceTo() {
        console.warn('Voice methods are not supported');
    }

    disableVoiceTo() {
        console.warn('Voice methods are not supported');
    }

    destroy() {
        if (!this.alt.valid) return;
        this.alt.destroy();
    }

    setOwnVariable(key, value) {
        this.alt.setLocalMeta(key, value);
    }

    setOwnVariables(obj) {
        for (const [key, value] of Object.entries(obj)) this.setOwnVariable(key, value);
    }

    getOwnVariable(key) {
        return this.alt.getLocalMeta(key);
    }
}

Object.defineProperty(alt.Player.prototype, 'mp', {
    get() {
        return this._mp ??= new _Player(this);
    }
});

alt.on('beforePlayerConnect', (info) => {
    const hwid = info.hwidHash + info.hwidExHash;
    if (hwid in bannedHwids) {
        return bannedHwids[hwid];
    }
});

mp.Player = _Player;

mp.players = new PlayerPool(EntityGetterView.fromClass(alt.Player));

alt.on('playerDeath', (player, killer, weapon) => {
    mp.events.dispatch('playerDeath', player.mp, weapon, killer && killer instanceof alt.Player ? killer.mp : null);
    player.emit(mp.prefix + 'dead', weapon, killer && killer instanceof alt.Player ? killer : null);
});

alt.on('playerConnect', (player) => {
    mp.events.dispatch('playerJoin', player.mp);
    mp.events.dispatch('playerReady', player.mp);
});

alt.on('playerDamage', (victim, attacker, healthDamage, armourDamage, weaponHash) => {
    mp.events.dispatch('playerDamage', victim.mp, healthDamage, armourDamage);
});

alt.on('playerDisconnect', (player, reason) => {
    mp.events.dispatch('playerQuit', player.mp, 'unimplemented', 'unimplemented'); //player, exitType: string, reason: string
});

alt.onClient(mp.prefix + 'setModel', (player, model) => {
    player.model = model;
});

alt.on('playerEnteringVehicle', (player, vehicle, seat) => {
    mp.events.dispatch('playerStartEnterVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
});

alt.on('playerEnteredVehicle', (player, vehicle, seat) => {
    mp.events.dispatch('playerEnterVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
});

alt.on('playerChangedVehicleSeat', (player, vehicle, oldSeat, seat) => {
    mp.events.dispatch('playerEnterVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
});

alt.on('playerLeftVehicle', (player, vehicle, seat) => {
    mp.events.dispatch('playerStartExitVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
    mp.events.dispatch('playerExitVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
});

alt.on('playerWeaponChange', (player, oldWeapon, newWeapon) => {
    mp.events.dispatch('playerWeaponChange', player.mp, oldWeapon, newWeapon);
});

// TODO: playerStreamIn, playerStreamOut
