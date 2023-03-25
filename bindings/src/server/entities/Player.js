import * as alt from "alt-server";
import mp from "../../shared/mp.js";
import { deg2rad, rad2deg, vdist, vdist2 } from "../../shared/utils.js";

export class _Player {
    alt;

    /** @param {alt.Player} alt */
    constructor(alt) {
        this.alt = alt;
    }

    get id() {
        return this.alt.id;
    }

    get action() { // TODO: check all the other existing values
        if (this.alt.vehicle) return "in_vehicle";
        return "stopped";
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

    get eyeColor() {
        return this.alt.getEyeColor();
    }

    set eyeColor(value) {
        return this.alt.setEyeColor(value);
    }

    // TODO: face features

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
        return this.alt.setHairHighlightColor(value);
    }

    get heading() {
        return this.alt.rot.z * rad2deg;
    }

    set heading(value) {
        this.alt.rot = new alt.Vector3(this.alt.rot.x, this.alt.rot.y, value * deg2rad);   
    }

    get health() {
        return this.alt.health;
    }

    set health(value) {
        this.alt.health = value;
    }

    // TODO: rgscId

    get ip() {
        return this.alt.ip;
    }

    get isAiming() {
        return this.alt.isAiming;
    }

    // TODO: is*

    get name() {
        return this.alt.name;
    }

    // TODO: packetLoss
    
    get ping() {
        return this.alt.ping;
    }

    get seat() {
        return this.alt.seat - 1; // RAGEMP seats start with 0
    }

    get streamedPlayers() {
        return alt.Player.all.filter(p => this.alt.isEntityInStreamRange(p)).map(p => p.mp); // TODO: implement in core
    }

    get vehicle() {
        return this.alt.vehicle?.mp ?? null;
    }

    // TODO: voiceListeners

    get weapon() {
        return this.alt.currentWeapon;
    }

    // TODO: weaponAmmo
    // TODO: weapons
    // TODO: alpha

    get dimension() {
        return this.alt.dimension;
    }

    set dimension(value) {
        this.alt.dimension = value;
    }

    get model() {
        return this.alt.model;
    }

    set model(value) {
        this.alt.model = value;
    }

    get position() {
        return new mp.Vector3(this.alt.position);
    }

    set position(value) {
        this.alt.position = value;
    }
    
    get type() {
        return "player";
    }

    // TODO: ban

    call(evt, args) {
        this.alt.emit(evt, ...args);
    }
    
    // TODO: rpc

    callToStreamed(includeSelf, evt, args) {
        if (includeSelf) this.call(evt, args);
        this.streamedPlayers.forEach(e => e.call(evt, args));
    }

    // TODO: callUnreliable

    // TODO: tattoos (decorations)

    getClothes(component) {
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
        const data = this.alt.getHeadOverlay(idx);
        return [data.index, data.opacity, data.colorIndex, data.secondColorIndex];
    }

    getProp(component) {
        return this.alt.getProp(component);
    }

    // TODO: getWeaponAmmo

    giveWeapon(weapon, ammo) { // TODO: object overload
        if (Array.isArray(weapon)) {
            if (Array.isArray(ammo)) {
                for (let i = 0; i < weapon.length; i++) {
                    this.giveWeapon(weapon[i], ammo[i] ?? 1);
                }
            } else {
                for (const weapon of weapon) {
                    this.giveWeapon(weapon[i], ammo);
                }
            }
            return;
        }

        this.alt.giveWeapon(weapon, ammo, true); // TODO: is true?
    }

    // TODO: invoke

    isStreamed(player) {
        return this.alt.isEntityInStreamRange(player.alt);
    }

    isStreamedFor(player) {
        return player.isStreamed(this);
    }

    kick(reason) {
        this.alt.kick(reason);
    }

    // TODO: kickSilent
    // TODO: notify
    // TODO: outputChatBox
    // TODO: playAnimation
    // TODO: playScenario

    putIntoVehicle(vehicle, seat) {
        this.alt.setIntoVehicle(vehicle.alt, seat + 1); // Seats in RAGEMP start with 0
    }

    removeFromVehicle() {
        this.alt.pos = this.alt.pos; // TODO: implement better in core
    }

    // TODO: removeObject

    removeWeapon(weapon) {
        this.alt.removeWeapon(weapon);
    }

    removeAllWeapons() {
        this.alt.removeAllWeapons();
    }

    // TODO: resetWeapon

    setClothes(component, drawable, texture, palette) {
        this.setClothes(component, drawable, texture, palette);
    }

    setCustomization(gender, shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, eyeColor, hairColor, highlightColor, faceFeatures) {
        this.alt.removeAllWeapons(); // TODO: is needed?
        // TODO: is model set needed?
        if (gender === true) this.alt.model = alt.hash("mp_m_freemode_01");
        else this.alt.model = alt.hash("mp_f_freemode_01");
        this.alt.setHeadBlendData(shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix);
        this.alt.setEyeColor(eyeColor);
        this.alt.setHairColor(hairColor);
        this.alt.setHairHighlightColor(highlightColor);
        for (let i = 0; i < Math.min(faceFeatures.length, 20); i++) {
            this.alt.setFaceFeature(i, faceFeatures[i]);
        }
    }

    setFaceFeature(idx, scale) {
        this.alt.setFaceFeature(idx, scale);
    }

    setHairColor(hairColor) {
        this.alt.setHairColor(hairColor);
    }

    setHeadBlend(shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix) {
        this.alt.setHeadBlendData(shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix);
    }
    
    setHeadOverlay(overlay, params) {
        const [index, opacity, firstColor, secondColor] = params;
        this.alt.setHeadOverlay(overlay, index, opacity);
        this.alt.setHeadOverlayColor(overlay, 0, firstColor, secondColor); // TODO: calc color type
    }

    setProp(prop, drawable, texture) {
        this.alt.setProp(prop, drawable, texture);
    }

    // TODO: setWeaponAmmo

    spawn(pos) {
        this.alt.spawn(pos);
    }

    // TODO: stopAnimation

    updateHeadBlend(shape, skin, third) {
        const headBlend = this.alt.getHeadBlendData();
        this.alt.setHeadBlendData(headBlend.shapeFirstID, headBlend.shapeSecondID, headBlend.shapeThirdID,
            headBlend.skinFirstID, headBlend.skinSecondID, headBlend.skinThirdID,
            shapeMix, skinMix, thirdMix);
    }

    // TODO: enableVoiceTo
    // TODO: disableVoiceTo
    // TODO: Weapons::clear
    
    destroy() {
        this.alt.destroy();
    }

    dist(pos) {
        return vdist(this.alt.pos, pos);
    }

    distSquared(pos) {
        return vdist2(this.alt.pos, pos);
    }

    // TODO: variables
}

Object.defineProperty(alt.Player.prototype, "mp", { 
    get() {
        return this._mp ??= new _Player(this);
    } 
});

mp.Player = _Player;

mp.players = {};

Object.defineProperty(mp.players, "length", { 
    get() {
        return alt.Player.all.length; // TODO: optimize, implement length in core
    }
});

// TODO: mp.players methods