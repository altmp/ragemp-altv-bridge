import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import { Pool } from '../Pool.js';
import { _Entity } from './Entity.js';

export class _Vehicle extends _Entity {
    alt;

    /** @param {alt.Vehicle} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get handle() {
        return this.alt.scriptID;
    }

    get remoteId() {
        return this.alt.remoteId;
    }

    get position() {
        return new mp.Vector3(this.alt.position);
    }

    get gear() {
        return this.alt.gear;
    }

    get rpm() {
        return this.alt.rpm;
    }

    // TODO: reverse and implement steeringAngle in core
    // TODO: nosActive (nitro)
    // TODO: nosAmount (nitro)
    // TODO: getHandling
    // TODO: getDefaultHandling

    get wheelCount() {
        return this.alt.wheelsCount;
    }

    get type() {
        return 'vehicle';
    }

    getWheelCamber(wheel) {
        return this.alt.getWheelCamber(wheel);
    }

    setWheelCamber(wheel, camber) {
        this.alt.setWheelCamber(wheel, camber);
    }

    getWheelTrackWidth(wheel) {
        return this.alt.getWheelTrackWidth(wheel);
    }

    setWheelTrackWidth(wheel, width) {
        this.alt.setWheelTrackWidth(wheel, width);
    }

    getWheelHeight(wheel) {
        return this.alt.getWheelHeight(wheel);
    }

    setWheelHeight(wheel, height) {
        this.alt.setWheelHeight(wheel, height);
    }

    getWheelWidth(wheel) {
        return this.alt.getWheelWidth(wheel);
    }

    setWheelWidth(wheel, width) {
        this.alt.setWheelWidth(wheel, width);
    }

    getWheelRadius(wheel) {
        return this.alt.getWheelRadius(wheel);
    }

    setWheelRadius(wheel, radius) {
        this.alt.setWheelRadius(wheel, radius);
    }

    getTyreRadius(wheel) {
        return this.alt.getWheelTyreRadius(wheel);
    }

    setTyreRadius(wheel, radius) {
        this.alt.setWheelTyreRadius(wheel, radius);
    }

    getTyreWidth(wheel) {
        return this.alt.getWheelTyreWidth(wheel);
    }

    setTyreWidth(wheel, width) {
        this.alt.setWheelTyreWidth(wheel, width);
    }

    getRimRadius(wheel) {
        return this.alt.getWheelRimRadius(wheel);
    }

    setRimRadius(wheel, radius) {
        this.alt.setWheelRimRadius(wheel, radius);
    }

    // #region Natives
    getPosition() {
        return new mp.Vector3(this.alt.pos);
    }

    setPosition(pos) {
        this.alt.pos = pos;
    }

    // TODO: forceStreamingUpdate?


    // TODO: setSuspensionHeight


    get setCreatesMoneyPickupsWhenExploded() {
        return this.setDropsMoneyWhenBlownUp;
    }

    get steerUnlockBias() {
        return this.setIsRacing;
    }

    getWindowTint() {
        return natives.getVehicleWindowTint(this.alt);
    }

    get isCargobobHookActive() {
        return this.doesCargobobHavePickUpRope;
    }

    // TODO: getTrailer

    getPedUsingDoor(doord) {
        return natives.getPedUsingVehicleDoor(this.alt, doord); 
    }

    get setHalt() {
        return this.bringToHalt;
    }

    getBoatAnchor() {
        return natives.isBoatAnchored(this.alt);
    }

    setBoatAnchor(state) {
        return natives.setBoatAnchor(this.alt, state);
    }

    get isAnySeatEmpty() {
        return this.areAnySeatsFree;
    }

    get setDoorBreakable() {
        return this.setDoorCanBreak;
    }
    
    get setPaintFade() {
        return this.setEnveffScale;
    }

    get WasCounterActivated() {
        return this.setHeliTailExplodeThrowDashboard;
    }

    setWheelType(type) {
        return natives.setVehicleWheelType(this.alt, type);
    }

    get getModColor2TextLabel() {
        return this.getModColor2Name;
    }

    get getPedEnabledBikeRingtone() {
        return this.isEntityAttachedToHandlerFrame;
    }

    setWindowTint(tint) {
        return natives.setVehicleWindowTint(this.alt, tint);
    }

    doesHaveStuckCheck() {
        return natives.doesVehicleHaveStuckVehicleCheck(this.alt);
    }

    setMod(modType, modIndex, customTires) {
        return natives.setVehicleMod(this.alt, modType, modIndex, customTires);
    }
    
    detachWindscreen() {
        return natives.popOutVehicleWindscreen(this.alt);
    }

    get isCargobobMagnetActive() {
        return this.doesCargobobHavePickupMagnet;
    }

    getMod(modType) {
        return natives.getVehicleMod(this.alt, modType);
    }

    get enableCargobobHook() {
        return this.createPickUpRopeForCargobob;
    }

    get setEnginePowerMultiplier() {
        return this.modifyTopSpeed;
    }

    get retractCargobobHook() {
        return this.removePickUpRopeForCargobob;
    }

    get cargobobMagnetGrab() {
        return this.setCargobobPickupMagnetActive;
    }

    setBikeLeanAngle(x, y) {
        return natives.setBikeOnStand(this.alt, x, y);
    }

    isBig() {
        return natives.isBigVehicle(this.alt);
    }

    get getPaintFade() {
        return this.getEnveffScale;
    }

    get getHeliEngineHealth() {
        return this.getHeliTailBoomHealth;
    }

    getWheelType() {
        return natives.getVehicleWheelType(this.alt);
    }

    get getModColor1TextLabel() {
        return this.getModColor1Name;
    }

    get setEngineTorqueMultiplier() {
        return this.setCheatPowerIncrease;
    }

    get isSirenSoundOn() {
        return this.setCheatPowerIncrease;
    }

    get setPlaneMinHeightAboveGround() {
        return this.setTaskGotoPlaneMinHeightAboveTerrain;
    }

    getPedInSeat(seatIndex, p2) {
        return natives.getPedInVehicleSeat(this.alt, seatIndex, p2)
    }

    get setPedTargettableDestroy() {
        return this.setIndividualDoorsLocked;
    }

    get jitter() {
        return this.setSubmarineCrushDepths;
    }

    get setLandingGear() {
        return this.controlLandingGear;
    }

    get setSirenSound() {
        return this.setHasMutedSirens;
    }
    
    get setAllsSpawn() {
        return this.setUseCutsceneWheelCompression;
    }

    get setTowTruckCraneHeight() {
        return this.setTowTruckArmPosition;
    }

    get hasClearLosToInFront() {
        return this.hasClearLosToEntityInFront;
    }

    get getPedIndexFromIndex() {
        return this.getVehicleIndexFromIndex;
    }

    get isAMission() {
        return this.isAMissionEntity;
    }

    get isTouching() {
        return this.isTouchingEntity;
    }

    setAlpha(alpha, skin) {
        return natives.setEntityAlpha(this.alt, alpha, skin);
    }

    get getVelocity() {
        return new mp.Vector3(natives.getEntityVelocity(this.alt));
    }
    
    getAlpha() {
        return natives.getEntityAlpha(this.alt);
    }

    get setCoords2() {
        return this.setCoordsWithoutPlantsReset;
    }

    get attachTo() {
        return this.attachToEntity;
    }

    get isAt() {
        return this.isAtEntity;
    }

    getModel() {
        return this.alt.model;
    }

    get setNoCollision() {
        return this.setNoCollisionEntity;
    }

    get clearLastDamage() {
        return this.clearLastDamageEntity;
    }

    get setAsMission() {
        return this.setAsMissionEntity;
    }

    get attachToPhysically() {
        return this.attachToEntityPhysically;
    }

    get hasBeenDamagedBy() {
        return this.hasBeenDamagedByEntity;
    }

    get isCollisionDisabled() {
        return this.getCollisionDisabled;
    }

    getObjectIndexFromIndex() {
        return natives.getObjectIndexFromEntityIndex(this.alt);
    }

    get isAttachedTo() {
        return this.isAttachedToEntity;
    }

    get hasClearLosTo() {
        return this.hasClearLosToEntity;
    }
    // #endregion
}

Object.defineProperty(alt.Vehicle.prototype, 'mp', { 
    get() {
        return this._mp ??= new _Vehicle(this);
    } 
});

mp.Vehicle = _Vehicle;

mp.vehicles = new Pool(() => alt.Player.all, () => alt.Player.streamedIn);

mp.vehicles.atRemoteId = function(id) {
    return alt.Vehicle.getByRemoteID(id)?.mp ?? null;
}

mp.vehicles.atHandle = function(handle) {
    return alt.Vehicle.getByScriptID(handle)?.mp ?? null;
}