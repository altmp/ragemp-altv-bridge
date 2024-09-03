import * as alt from 'alt-server';
import {SyncedMetaProxy} from '../../shared/meta.js';
import mp from '../../shared/mp.js';
import {deg2rad, hashIfNeeded, mpSeatToAlt, rad2deg, TemporaryContainer} from '../../shared/utils.js';
import {_Entity} from './Entity.js';
import {ServerPool} from '../pools/ServerPool';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {BaseObjectType} from '../../shared/BaseObjectType';
import {VehiclePool} from '../pools/VehiclePool.js';

export class _Vehicle extends _Entity {
    /** @type {import('alt-server').Vehicle} */
    alt;

    /** @param {alt.Vehicle} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        this.data = new SyncedMetaProxy(alt);
    }

    get driver() {
        return this.alt.driver?.mp;
    }

    get bodyHealth() {
        return this.alt.bodyHealth;
    }

    set bodyHealth(value) {
        this.alt.bodyHealth = value;
    }

    // TODO: brake

    get dashboardColor() {
        return this.alt.dashboardColor;
    }

    set dashboardColor(value) {
        this.alt.dashboardColor = value;
    }

    // TODO: setter for dead

    get dead() {
        return this.alt.destroyed;
    }

    _engine = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    get engine() {
        return this._engine.value ?? this.alt.engineOn;
    }

    set engine(value) {
        this._engine.value = this.alt.engineOn = value;
    }

    get engineHealth() {
        return this.alt.engineHealth;
    }

    set engineHealth(value) {
        this.alt.engineHealth = value;
    }

    // TODO: extras
    // TODO: highbeams
    // TODO: horn

    get livery() {
        return this.alt.livery;
    }

    set livery(value) {
        this.alt.livery = value;
    }

    get locked() {
        return this.alt.lockState > 1;
    }

    set locked(value) {
        this.alt.lockState = value ? 2 : 1;
    }

    get movable() {
        return !this.alt.frozen;
    }

    set movable(value) {
        this.alt.frozen = !value;
    }
    // TODO: mods

    _neon = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    get neonEnabled() {
        return this._neon.value ?? (this.alt.neon.back || this.alt.neon.front || this.alt.neon.left || this.alt.neon.right);
    }

    set neonEnabled(value) {
        this._neon.value = value;
        this.alt.neon = { left: value, right: value, front: value, back: value };
    }

    get numberPlate() {
        return this.alt.numberPlateText;
    }

    set numberPlate(value) {
        this.alt.numberPlateText = value;
    }

    get numberPlateType() {
        return this.alt.numberPlateIndex;
    }

    set numberPlateType(value) {
        this.alt.numberPlateIndex = value;
    }

    get pearlescentColor() {
        return this.alt.pearlColor;
    }

    set pearlescentColor(value) {
        this.alt.pearlColor = value;
    }

    // TODO: rocketBoost

    get siren() {
        return this.alt.sirenActive;
    }

    set siren(value) {
        this.alt.sirenActive = value;
    }

    get horn() {
        return false; // TODO
    }

    get steerAngle() {
        return 0;
    }

    set steerAngle(value) {
        // TODO: steerAngle
    }

    get streamedPlayers() {
        const arr = alt.getEntitiesInRange(this.alt.pos, mp.streamingDistance, this.alt.dimension, 1);
        return arr.filter(e => e.isEntityInStreamRange(this.alt)).map(e => e.mp); // TODO: implement in js module
    }

    // TODO: taxiLights
    // TODO: trimColor

    get trailer() {
        return this.alt.attached?.mp ?? null;
    }

    get trailedBy() {
        return this.alt.attachedTo?.mp ?? null;
    }

    get velocity() {
        return new mp.Vector3(this.alt.velocity);
    }

    _setWindowTint = false;
    get windowTint() {
        if (!this._setWindowTint) return 255;
        return this.alt.windowTint;
    }
    set windowTint(value) {
        this._setWindowTint = true;
        this.alt.windowTint = value;
    }

    _wheelColor = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    _setWheelColor = false;
    get wheelColor() {
        if (!this._setWheelColor) return 255;

        return this._wheelColor.value ?? this.alt.wheelColor;
    }

    set wheelColor(value) {
        this._setWheelColor = true;
        this._wheelColor.value = this.alt.wheelColor = value;
    }

    get wheelType() {
        return this.alt.wheelType;
    }

    set wheelType(value) {
        this.alt.setWheels(value, this.alt.frontWheels);
    }

    // TODO: alpha

    get model() {
        return this.alt.model;
    }

    set model(value) {
        const newVehicle = new alt.Vehicle(value, this.alt.pos, this.alt.rot);
        newVehicle.dimension = this.alt.dimension;
        newVehicle.numberPlateText = this.alt.numberPlateText;
        newVehicle.numberPlateIndex = this.alt.numberPlateIndex;
        if (newVehicle.modKitsCount > 0) newVehicle.modKit = 1;
        const players = alt.Player.all.filter(e => e.vehicle === this.alt);
        for (const player of players) {
            player.setIntoVehicle(newVehicle, player.seat);
        }

        this.alt.destroy();
        this.alt = newVehicle;
    }

    type = 'vehicle';

    explode() {
        if (this.alt.netOwner) {
            this.alt.setTimedExplosion(true, this.alt.netOwner, 1);
        } else {
            this.alt.bodyHealth = -1;
        }
    }

    getColor(id) {
        return id === 0 ? this.alt.primaryColor : this.alt.secondaryColor;
    }

    getColorRGB(id) {
        return (id === 0 ? this.alt.customPrimaryColor : this.alt.customSecondaryColor).toArray().slice(0, 3);
    }

    getExtra(id) {
        return this.alt.getExtra(id);
    }

    getMod(id) {
        return this.alt.getMod(id) - 1;
    }

    _neonColor = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    getNeonColor() {
        const color = this._neonColor.value ?? this.alt.neonColor;
        return [color.r, color.g, color.b];
    }

    getOccupant(id) {
        if (mpSeatToAlt(id) === 1) return this.alt.driver?.mp;
        // TODO: implement in core

        return this.alt.passengers?.[mpSeatToAlt(id)]?.mp;
    }

    getOccupants() {
        // TODO: implement in core
        const occupants = [];
        const driver = this.alt.driver;
        if (driver) occupants.push(driver.mp);

        const passengers = Object.values(this.alt.passengers);
        if (passengers?.length) occupants.push(...passengers.map(p => p.mp));

        return occupants;
    }

    // TODO: getPaint
    getPaint() {
        return 0;
    }

    isStreamed(player) {
        return player.isEntityInStreamRange(this.alt);
    }

    isStreamedFor(player) {
        return player.alt.isEntityInStreamRange(this.alt);
    }

    repair() {
        this.alt.repair();
    }

    setColor(primary, secondary) {
        this.alt.primaryColor = primary;
        this.alt.secondaryColor = secondary;
    }

    setColorRGB(r1, g1, b1, r2, g2, b2) {
        this.alt.customPrimaryColor = new alt.RGBA(r1, g1, b1);
        this.alt.customSecondaryColor = new alt.RGBA(r2, g2, b2);
    }

    setExtra(extraId, disabled) {
        this.alt.setExtra(extraId - 1, !disabled);
    }

    setMod(type, index) {
        index = (index >= 255 || index < 0) ? 0 : index + 1;

        try {
            switch(type) {
                case 55:
                    this.windowTint = index;
                    break;
                case 53:
                    this.numberPlateType = index;
                    break;
                case 66:
                    this.alt.primaryColor = index;
                    break;
                case 67:
                    this.alt.secondaryColor = index;
                    break;
                default:
                    this.alt.setMod(type, index);
                    break;
            }
        } catch(e) {
            console.log(`Failed to set mod ${type} to ${index} on vehicle ${this.id}: ${e}`);
            mp._notifyError(e, 'unknown', 0, e.stack, 'warning');
        }
    }

    setNeonColor(r, g, b) {
        this._neonColor.value = this.alt.neonColor = new alt.RGBA(r, g, b, 255);
    }

    setOccupant(seat, player) {
        player.alt.setIntoVehicle(this.alt, seat + 1);
    }

    setPaint(colorType, color) {
        // todo setPaint
    }

    spawn(pos, heading) {
        this.position = pos;
        this.rotation = new mp.Vector3(0, 0, heading * rad2deg);
    }
}

Object.defineProperty(alt.Vehicle.prototype, 'mp', {
    get() {
        return this._mp ??= new _Vehicle(this);
    }
});

mp.Vehicle = _Vehicle;

mp.vehicles = new VehiclePool(EntityGetterView.fromClass(alt.Vehicle, [BaseObjectType.Vehicle]), [_Vehicle], 2);

mp.vehicles.new = function(model, position, options = {}) {
    model = hashIfNeeded(model);
    const heading = options?.heading ?? 0;
    let veh;
    try {
        veh = new alt.Vehicle(model, position, new alt.Vector3(0, 0, heading * deg2rad));
    } catch(e) {
        console.log('Failed to spawn vehicle model ' + model + ', falling back to kuruma: ' + (e?.stack ?? String(e)));
        mp._notifyError(e, 'unknown', 0, e.stack, 'warning');
        veh = new alt.Vehicle(alt.hash('kuruma'), position, new alt.Vector3(0, 0, heading * deg2rad));
    }
    if (veh.modKitsCount > 0) veh.modKit = 1;
    if ('numberPlate' in options) veh.numberPlateText = options.numberPlate;
    // TODO: alpha
    if ('locked' in options) veh.mp.locked = options.locked;
    if ('engine' in options) veh.engineOn = options.engine;
    if ('dimension' in options) veh.mp.dimension = options.dimension;
    if ('color' in options) {
        veh.customPrimaryColor = new alt.RGBA(options.color[0]);
        veh.customSecondaryColor = new alt.RGBA(options.color[1]);
    }
    return veh.mp;
};

alt.on('vehicleDamage', (vehicle, attacker, bodyHealthDamage, additionalBodyHealthDamage, engineHealthDamage, petrolTankDamage, weapon) => {
    mp.events.dispatchLocal('vehicleDamage', vehicle.mp, bodyHealthDamage, engineHealthDamage);
});

alt.on('vehicleAttach', (vehicle, attachedVehicle) => {
    mp.events.dispatchLocal('trailerAttached', vehicle.mp, attachedVehicle.mp);
});

alt.on('vehicleHorn', (vehicle, player, state) => {
    mp.events.dispatchLocal('vehicleHornToggle', vehicle.mp, state);
});

alt.on('vehicleSiren', (vehicle, player, state) => {
    mp.events.dispatchLocal('vehicleSirenToggle', vehicle.mp, state);
});

alt.on('vehicleDestroy', (vehicle) => {
    mp.events.dispatchLocal('vehicleDeath', vehicle.mp);
});
