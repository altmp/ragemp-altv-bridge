import * as alt from 'alt-server';
import { SyncedMetaProxy } from '../../shared/meta.js';
import mp from '../../shared/mp.js';
import {
    altSeatToMp,
    argsToAlt, clamp,
    deg2rad, getOverlayColorType,
    hashIfNeeded, internalName,
    rad2deg,
    TemporaryContainer,
    vdist,
    vdist2
} from '../../shared/utils.js';
import { _Entity } from './Entity.js';
import { PlayerPool } from '../pools/PlayerPool';
import { InternalChat } from '../../shared/DefaultChat.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {emitAllClientsInternal, emitClient, emitClientInternal, emitClientUnreliable} from '../serverUtils';
import {BaseObjectType} from '../../shared/BaseObjectType';

let bannedHwids = {};
const ipRegex = /^::ffff:([0-9.]+)$/;

const mpModels = [alt.hash('mp_m_freemode_01'), alt.hash('mp_f_freemode_01')];
export class _Player extends _Entity {
    /** @type {alt.Player} alt */
    alt;

    /** @param {alt.Player} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        this.data = new SyncedMetaProxy(alt);
    }

    #needHeadblend() {
        return mpModels.includes(this.model);
        // if (this.alt.hasMeta(internalName('headblendInit'))) return;
        // this.alt.setHeadBlendData(0, 0, 0, 0, 0, 0, 0, 0, 0);
        // this.alt.setMeta(internalName('headblendInit'), true);
    }

    set canRequestEntityControl(value) {
        this.alt.netOwnershipDisabled = !value;
    }

    get canRequestEntityControl() {
        return !this.alt.netOwnershipDisabled;
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
        return Object.fromEntries(this.alt.weapons.map(e => [e.hash, this.alt.getWeaponAmmo(e.hash)])); // TODO: ammo
    }


    _armour = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    get armour() {
        return (this._armour.value ?? this.alt.armour);
    }
    set armour(value) {
        this._armour.value = this.alt.armour = value;
    }

    _eyeColor = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    get eyeColor() {
        if (!this.#needHeadblend()) return 0;
        return (this._eyeColor.value ?? this.alt.getEyeColor());
    }
    set eyeColor(value) {
        if (!this.#needHeadblend()) return;
        this._eyeColor.value = value;
        this.alt.setEyeColor(value);
    }

    get faceFeatures() {
        throw new Error('faceFeatures getter is not supported (does not work on 1.1)');
    }

    get hairColor() {
        if (!this.#needHeadblend()) return 0;
        return this.alt.getHairColor();
    }

    set hairColor(value) {
        if (!this.#needHeadblend()) return;
        this.alt.setHairColor(value);
    }

    get hairHighlightColor() {
        if (!this.#needHeadblend()) return 0;
        return this.alt.getHairHighlightColor();
    }

    set hairHighlightColor(value) {
        if (!this.#needHeadblend()) return;
        this.alt.setHairHighlightColor(value);
    }

    get heading() {
        return this.alt.rot.z * rad2deg;
    }

    set heading(value) {
        this.alt.rot = new alt.Vector3(this.alt.rot.x, this.alt.rot.y, value * deg2rad);
    }

    _health = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    get health() {
        const value = (this._health.value ?? this.alt.health) - 100;
        return Math.max(value, 0);
    }
    set health(value) {
        const val = value <= 0 ? 99 : (value + 100);
        this._health.value = this.alt.health = val;
    }

    get rgscId() {
        return this.alt.cloudID ?? '';
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
        if (!this.alt.currentWeapon) return 0;
        return this.alt.getWeaponAmmo(this.alt.currentWeapon);
    }

    set weaponAmmo(value) {
        if (!this.alt.currentWeapon) return;
        this.alt.setWeaponAmmo(this.alt.currentWeapon, value);
    }

    get alpha() {
        return this.alt.getStreamSyncedMeta(internalName('alpha'));
    }

    set alpha(value) {
        this.alt.setStreamSyncedMeta(internalName('alpha'), value);
    }

    get model() {
        return this.alt.model;
    }

    set model(value) {
        value = hashIfNeeded(value);
        const oldModel = this.alt.model;
        this.alt.model = value;
        if (mpModels.includes(value))
            this.alt.setHeadBlendData(0, 0, 0, 0, 0, 0, 0, 0, 0);
        mp.events.dispatchLocal('entityModelChange', this, oldModel);
    }

    type = 'player';

    ban(reason = 'You were banned') {
        this.bannedHwids[this.alt.hwidHash + this.alt.hwidExHash] = reason;
    }

    call(evt, args = []) {
        emitClient(this.alt, evt, ...argsToAlt(args));
    }

    callUnreliable(evt, args = []) {
        emitClientUnreliable(this.alt, evt, ...argsToAlt(args));
    }

    callProc(evt, args = []) {
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
        if (includeSelf) emitClient(this.alt, evt, ...altArgs);
        emitClient(alt.Player.all.filter(p => this.alt.isEntityInStreamRange(p)), evt, ...altArgs);
    }

    callToStreamedUnreliable(includeSelf, evt, args) {
        const altArgs = argsToAlt(args);
        if (includeSelf) emitClientUnreliable(this.alt, evt, ...altArgs);
        emitClientUnreliable(alt.Player.all.filter(p => this.alt.isEntityInStreamRange(p)), evt, ...altArgs);
    }

    // TODO: tattoos (decorations)

    getClothes(component) {
        if (!this.#needHeadblend()) return;
        return this.alt.getClothes(component);
    }

    getFaceFeature(idx) {
        return this.alt.getFaceFeatureScale(idx);
    }

    getHeadBlend() {
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
        if (!this.#needHeadblend()) return;
        const data = this.alt.getHeadOverlay(idx);
        return [data.index, data.opacity, data.colorIndex, data.secondColorIndex];
    }

    getProp(component) {
        return this.alt.getProp(component);
    }

    getWeaponAmmo(weaponHash) {
        if (!this.alt.weapons.some(e => e.hash === weaponHash)) return 0; // todo implement HasWeapon in core
        return this.alt.getWeaponAmmo(hashIfNeeded(weaponHash)) ?? 0;
    }

    giveWeapon(weapon, ammo) {
        if (ammo == null) return;

        if (Array.isArray(weapon)) {
            if (Array.isArray(ammo)) {
                for (let i = 0; i < weapon.length; i++) {
                    this.giveWeapon(weapon[i], ammo[i] ?? 0);
                }
            } else {
                for (const hash of weapon) {
                    this.giveWeapon(hash, ammo);
                }
            }
            return;
        }

        mp.events.dispatchLocal('_giveWeapon', this, weapon, ammo);
        this.alt.giveWeapon(weapon, ammo, true);
    }

    invoke(native, ...args) {
        emitClientInternal(this.alt, 'invoke', native, ...argsToAlt(args));
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
        this.alt.playAnimation(dict, name, speed, speed, -1, flag, 0, false, false, false);
    }

    outputChatBox(message) {
        InternalChat.send(this.alt, message);
    }

    notify(message) {
        emitClientInternal(this.alt, 'notify', message);
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
        this.alt.removeWeapon(hashIfNeeded(weapon));
    }

    removeAllWeapons() {
        this.alt.removeAllWeapons();
    }

    setClothes(component, drawable, texture, palette) {
        this.alt.setClothes(component, drawable, texture, palette);
    }

    setCustomization(gender, shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, eyeColor, hairColor, highlightColor, faceFeatures) {
        if (!this.#needHeadblend()) return;
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
        if (!this.#needHeadblend()) return;
        this.alt.setFaceFeature(idx, scale);
    }

    setHairColor(hairColor, hairHighlightColor) {
        if (!this.#needHeadblend()) return;
        this.alt.setHairColor(hairColor);
        if (hairHighlightColor != null) this.alt.setHairHighlightColor(hairHighlightColor);
    }

    setHeadBlend(shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix) {
        if (!this.#needHeadblend()) return;
        this.alt.setHeadBlendData(shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix);
    }

    setHeadOverlay(overlay, params) {
        if (!this.#needHeadblend()) return;
        let [index, opacity, firstColor, secondColor] = params;
        if (typeof overlay !== 'number' || typeof index !== 'number' || typeof opacity !== 'number'
            || typeof firstColor !== 'number' || typeof secondColor !== 'number') return console.warn('Invalid head overlay params', overlay, params);

        this.alt.setHeadOverlay(overlay, Math.max(index, 0), clamp(opacity, 0, 255));

        this.alt.setHeadOverlayColor(overlay, getOverlayColorType(overlay), firstColor, secondColor);
    }

    setProp(prop, drawable, texture) {
        this.alt.clearProp(prop);
        this.alt.setProp(prop, drawable, texture);
    }

    setWeaponAmmo(weapon, ammo) {
        this.alt.setWeaponAmmo(hashIfNeeded(weapon), ammo);
    }

    spawn(pos) {
        this.alt.removeAllWeapons();
        this.alt.spawn({ x: pos.x, y: pos.y, z: pos.z - 1 });
        mp.events.dispatchLocal('playerSpawn', this);
    }

    stopAnimation() {
        this.alt.clearTasks();
    }

    updateHeadBlend(shape, skin, third) {
        if (!this.#needHeadblend()) return;
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

    toString() {
        return `${this.constructor.name}<${this.id ?? -1}, '${this.name}', '${this.socialClub}'>`;
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

mp.players = new PlayerPool(EntityGetterView.fromClass(alt.Player, [BaseObjectType.Player]), [_Player], 1);

alt.on('playerDeath', (player, killer, weapon) => {
    mp.events.dispatchLocal('playerDeath', player.mp, weapon, killer && killer instanceof alt.Player ? killer.mp : null);
    if (mp._main) emitClientInternal(player, 'dead', weapon, killer && killer instanceof alt.Player ? killer : null);
});

alt.on('playerConnect', (player) => {
    alt.emit('earlyPlayerConnect', player);
    mp.events.dispatchLocal('playerJoin', player.mp);

    if (mp._main && mp._broadcastJoinLeave) emitAllClientsInternal('join', player);
});

alt.on('playerDamage', (victim, attacker, healthDamage, armourDamage, weaponHash) => {
    mp.events.dispatchLocal('playerDamage', victim.mp, healthDamage, armourDamage);
});

alt.on('playerDisconnect', (player, reason) => {
    if (mp._main && mp._broadcastJoinLeave) emitAllClientsInternal('quit', player);
    mp.events.dispatchLocal('playerQuit', player.mp, 'unimplemented', 'unimplemented'); //player, exitType: string, reason: string
});

alt.onClient(internalName('setModel'), (player, model) => {
    player.model = model;
});

alt.on('playerEnteringVehicle', (player, vehicle, seat) => {
    mp.events.dispatchLocal('playerStartEnterVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
});

alt.on('playerEnteredVehicle', (player, vehicle, seat) => {
    mp.events.dispatchLocal('playerEnterVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
});

alt.on('playerChangedVehicleSeat', (player, vehicle, oldSeat, seat) => {
    mp.events.dispatchLocal('playerEnterVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
});

alt.on('playerLeftVehicle', (player, vehicle, seat) => {
    mp.events.dispatchLocal('playerStartExitVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
    mp.events.dispatchLocal('playerExitVehicle', player.mp, vehicle?.mp, altSeatToMp(seat));
});

alt.on('playerWeaponChange', (player, oldWeapon, newWeapon) => {
    mp.events.dispatchLocal('playerWeaponChange', player.mp, oldWeapon, newWeapon);
});

// TODO: playerStreamIn, playerStreamOut
