import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import { ClientPool } from '../ClientPool.js';
import { _Entity } from './Entity.js';
import { _Colshape } from './Colshape';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {EntityMixedView} from '../../shared/pools/EntityMixedView';
import {hashIfNeeded, toAlt, toMp} from '../../shared/utils';

/** @type {Record<string, string>} */
const keys = {'handlingnamehash':'handlingNameHash','mass':'mass','initialdragcoeff':'initialDragCoeff','downforcemodifier':'downforceModifier','unkfloat1':'unkFloat1','unkfloat2':'unkFloat2','centreofmassoffset':'centreOfMassOffset','inertiamultiplier':'inertiaMultiplier','percentsubmerged':'percentSubmerged','percentsubmergedratio':'percentSubmergedRatio','drivebiasfront':'driveBiasFront','acceleration':'acceleration','initialdrivegears':'initialDriveGears','driveinertia':'driveInertia','clutchchangeratescaleupshift':'clutchChangeRateScaleUpShift','clutchchangeratescaledownshift':'clutchChangeRateScaleDownShift','initialdriveforce':'initialDriveForce','drivemaxflatvel':'driveMaxFlatVel','initialdrivemaxflatvel':'initialDriveMaxFlatVel','brakeforce':'brakeForce','unkfloat4':'unkFloat4','brakebiasfront':'brakeBiasFront','brakebiasrear':'brakeBiasRear','handbrakeforce':'handBrakeForce','steeringlock':'steeringLock','steeringlockratio':'steeringLockRatio','tractioncurvemax':'tractionCurveMax','tractioncurvemaxratio':'tractionCurveMaxRatio','tractioncurvemin':'tractionCurveMin','tractioncurveminratio':'tractionCurveMinRatio','tractioncurvelateral':'tractionCurveLateral','tractioncurvelateralratio':'tractionCurveLateralRatio','tractionspringdeltamax':'tractionSpringDeltaMax','tractionspringdeltamaxratio':'tractionSpringDeltaMaxRatio','lowspeedtractionlossmult':'lowSpeedTractionLossMult','camberstiffness':'camberStiffness','tractionbiasfront':'tractionBiasFront','tractionbiasrear':'tractionBiasRear','tractionlossmult':'tractionLossMult','suspensionforce':'suspensionForce','suspensioncompdamp':'suspensionCompDamp','suspensionrebounddamp':'suspensionReboundDamp','suspensionupperlimit':'suspensionUpperLimit','suspensionlowerlimit':'suspensionLowerLimit','suspensionraise':'suspensionRaise','suspensionbiasfront':'suspensionBiasFront','suspensionbiasrear':'suspensionBiasRear','antirollbarforce':'antiRollBarForce','antirollbarbiasfront':'antiRollBarBiasFront','antirollbarbiasrear':'antiRollBarBiasRear','rollcentreheightfront':'rollCentreHeightFront','rollcentreheightrear':'rollCentreHeightRear','collisiondamagemult':'collisionDamageMult','weapondamagemult':'weaponDamageMult','deformationdamagemult':'deformationDamageMult','enginedamagemult':'engineDamageMult','petroltankvolume':'petrolTankVolume','oilvolume':'oilVolume','unkfloat5':'unkFloat5','seatoffsetdistx':'seatOffsetDistX','seatoffsetdisty':'seatOffsetDistY','seatoffsetdistz':'seatOffsetDistZ','monetaryvalue':'monetaryValue','modelflags':'modelFlags','handlingflags':'handlingFlags','damageflags':'damageFlags'};
const store = new EntityStoreView();
const view = new EntityMixedView(store, EntityGetterView.fromClass(alt.Vehicle));

export class _Vehicle extends _Entity {
    alt;

    /** @param {alt.Vehicle} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get handle() {
        if (!this.alt.valid) return 0;
        return this.alt.scriptID;
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        if(this.alt.netOwner != alt.Player.local) {
            console.error(`You cannot set the position of the vehicle if you are not the network owner!`);
        } else {
            // this.alt.pos = value;
            natives.setEntityCoordsNoOffset(this.alt, value.x, value.y, value.z, false, false, false);
        }
    }

    get rotation() {
        return new mp.Vector3(this.alt.rot.toDegrees());
    }

    set rotation(value) {
        if(this.alt.netOwner != alt.Player.local) {
            console.error(`You cannot set the rotation of the vehicle if you are not the network owner!`);
        } else {
            natives.setEntityRotation(this.handle, value.x, value.y, value.z, 2, false);
        }
    }

    get gear() {
            return this.alt.gear;
    }

    get rpm() {
        return this.alt.rpm;
    }

    set rpm(value) {
        this.alt.rpm = value;
    }

    get steeringAngle() {
        return 0;
    }

    set steeringAngle(value) {
        // TODO
    }

    // TODO: reverse and implement steeringAngle in core
    // TODO: nosActive (nitro)
    // TODO: nosAmount (nitro)

    #convertHandlingId(handlingId) {
        if (typeof handlingId != 'string' || handlingId.length < 2) return;
        const key = handlingId.slice(1).toLowerCase();
        return keys[key] ?? key;
    }

    setHandling(id, value) {
        if (!this.alt.handling) return;
        this.alt.handling[this.#convertHandlingId(id)] = value;
    }

    getHandling(id) {
        if (!this.alt.handling) return;
        const key = this.#convertHandlingId(id);
        return this.alt.handling[this.#convertHandlingId(id)];
    }

    getDefaultHandling(id) {
        if (!this.alt.handling) return;
        const handling = alt.HandlingData.getForHandlingName(this.alt.handling.handlingNameHash);
        return handling[this.#convertHandlingId(id)];
    }

    get wheelCount() {
        return this.alt.wheelsCount;
    }

    type = 'vehicle';

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

    //#region Natives
    getPosition() {
        return new mp.Vector3(this.alt.pos);
    }

    setPosition(pos) {
        this.alt.pos = pos;
    }

    // TODO: forceStreamingUpdate?



    getSuspensionHeight() {
        return 0;
    }

    // TODO: setSuspensionHeight


    get setCreatesMoneyPickupsWhenExploded() {
        return this.setDropsMoneyWhenBlownUp;
    }

    get steerUnlockBias() {
        return this.setIsRacing;
    }

    getWindowTint() {
        return natives.getVehicleWindowTint(this.handle);
    }

    get isCargobobHookActive() {
        return this.doesCargobobHavePickUpRope;
    }

    // TODO: getTrailer

    getPedUsingDoor(doord) {
        return natives.getPedUsingVehicleDoor(this.handle, doord);
    }

    get setHalt() {
        return this.bringToHalt;
    }

    getBoatAnchor() {
        return natives.isBoatAnchored(this.handle);
    }

    setBoatAnchor(state) {
        return natives.setBoatAnchor(this.handle, state);
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
        return natives.setVehicleWheelType(this.handle, type);
    }

    get getModColor2TextLabel() {
        return this.getModColor2Name;
    }

    get getPedEnabledBikeRingtone() {
        return this.isEntityAttachedToHandlerFrame;
    }

    setWindowTint(tint) {
        return natives.setVehicleWindowTint(this.handle, tint);
    }

    doesHaveStuckCheck() {
        return natives.doesVehicleHaveStuckVehicleCheck(this.handle);
    }

    setMod(modType, modIndex, customTires) {
        return natives.setVehicleMod(this.handle, modType, modIndex, customTires);
    }

    detachWindscreen() {
        return natives.popOutVehicleWindscreen(this.handle);
    }

    get isCargobobMagnetActive() {
        return this.doesCargobobHavePickupMagnet;
    }

    getMod(modType) {
        return natives.getVehicleMod(this.handle, modType);
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
        return natives.setBikeOnStand(this.handle, x, y);
    }

    isBig() {
        return natives.isBigVehicle(this.handle);
    }

    get getPaintFade() {
        return this.getEnveffScale;
    }

    get getHeliEngineHealth() {
        return this.getHeliTailBoomHealth;
    }

    getWheelType() {
        return natives.getVehicleWheelType(this.handle);
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
        return natives.getPedInVehicleSeat(this.handle, seatIndex, p2);
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

    getPedIndexFromIndex() {
        natives.getPedIndexFromEntityIndex(this.handle);
    }

    get isAMission() {
        return this.isAMissionEntity;
    }

    get isTouching() {
        return this.isTouchingEntity;
    }

    setAlpha(alpha, skin) {
        return natives.setEntityAlpha(this.handle, alpha, skin);
    }

    getVelocity() {
        return new mp.Vector3(natives.getEntityVelocity(this.handle));
    }

    getAlpha() {
        return natives.getEntityAlpha(this.handle);
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
        return natives.getObjectIndexFromEntityIndex(this.handle);
    }

    get isAttachedTo() {
        return this.isAttachedToEntity;
    }

    get hasClearLosTo() {
        return this.hasClearLosToEntity;
    }
    //#endregion
}

export class _LocalVehicle extends _Vehicle {
    #handle = 0;
    #model = 0;

    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.#model = alt.getMeta(mp.prefix + 'model');
        store.add(this, this.id, this.#handle, 65535);
    }
    destroy() {
        if (!this.alt.valid) return;
        if (this.alt.isStreamedIn) this.streamOut(); // TODO: fix in core
        this.alt.destroy();
        store.remove(this.id, this.#handle, 65535);
    }

    get id() {
        if (!this.alt.valid) return -1;
        return this.alt.id + 65536;
    }

    get model() {
        return this.#model;
    }

    set model(value) {
        if (this.alt.isStreamedIn) this.streamOut();
        this.#model = value;
        if (this.alt.isStreamedIn) this.streamIn();
    }

    get remoteId() {
        return 65535;
    }

    get rpm() {
        return 0; // TODO
    }

    get handle() {
        return this.#handle;
    }

    get position() {
        return new mp.Vector3(natives.getEntityCoords(this.handle, false));
    }

    set position(value) {
        natives.setEntityCoordsNoOffset(this.#handle, value.x, value.y, value.z, false, false, false);
    }

    get gear() {
        return 0; // TODO
    }

    get wheelCount() {
        return 4; // TODO
    }

    streamIn() {
        alt.loadModel(this.#model);
        this.#handle = natives.createVehicle(this.#model, this.alt.pos.x, this.alt.pos.y, this.alt.pos.z, this.alt.getMeta(mp.prefix + 'heading'), false, false, false);
        natives.setVehicleColourCombination(this.#handle, 0);
        store.add(this, undefined, this.#handle, undefined);
    }

    streamOut() {
        store.remove(undefined, this.#handle, undefined);
        this.alt.setMeta(mp.prefix + 'heading', natives.getEntityHeading(this.#handle));
        natives.deleteVehicle(this.#handle);
        this.#handle = 0;
        natives.setModelAsNoLongerNeeded(this.#model);
    }

    posChange() {}
    onDestroy() {}
    onCreate() {}
    update() {}

    getVariable(key) {
        if (this.alt.isRemote) return toMp(this.alt.getStreamSyncedMeta(key));
        return toMp(this.alt.getMeta(key));
    }

    setVariable(key, value) {
        if (this.alt.isRemote) return;
        this.alt.setMeta(key, toAlt(value));
    }

    hasVariable(key) {
        if (this.alt.isRemote) return this.alt.hasStreamSyncedMeta(key);
        return this.alt.hasMeta(key);
    }
}

Object.defineProperty(alt.Vehicle.prototype, 'mp', {
    get() {
        return this._mp ??= new _Vehicle(this);
    }
});

mp.Vehicle = _Vehicle;

mp.vehicles = new ClientPool(view);

const group = new alt.VirtualEntityGroup(100);
mp.vehicles.new = function(model, position, params = {}) {
    model = hashIfNeeded(model);
    if (!natives.isModelValid(model)) model = alt.hash('oracle');
    const virtualEnt = new alt.VirtualEntity(group, position, mp.streamingDistance);
    virtualEnt.setMeta(mp.prefix + 'type', VirtualEntityID.LocalVehicle);
    virtualEnt.setMeta(mp.prefix + 'model', model);
    virtualEnt.setMeta(mp.prefix + 'heading', params.heading ?? 0);

    /** @type {_LocalVehicle} */
    const ent = virtualEnt.mp;

    if ('dimension' in params) ent.dimension = params.dimension;

    if (!virtualEnt.isStreamedIn) return ent;
    if ('heading' in params) ent.setRotation(0, 0, params.heading, 2, false);
    if ('numberPlate' in params) ent.setNumberPlateText(params.numberPlate);
    if ('alpha' in params) ent.setAlpha(params.alpha, false);
    if ('color' in params) {
        ent.setCustomPrimaryColour(params.color[0][0], params.color[0][1], params.color[0][2]);
        ent.setCustomSecondaryColour(params.color[1][0], params.color[1][1], params.color[1][2]);
    }
    if ('locked' in params) ent.setDoorsLocked(params.locked ? 2 : 1);
    if ('engine' in params) ent.setEngineOn(params.engine, true, false);
    return ent;
};
