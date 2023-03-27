import * as alt from 'alt-server';
import { SyncedMetaProxy } from '../../shared/meta.js';
import mp from '../../shared/mp.js';
import { deg2rad, rad2deg, vdist, vdist2 } from '../../shared/utils.js';
import { _Entity } from './Entity.js';
import { Pool } from '../Pool.js';

export class _Vehicle extends _Entity {
    alt;

    /** @param {alt.Vehicle} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        this.data = new SyncedMetaProxy(alt);
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

    get engine() {
        return this.alt.engineOn;
    }

    set engine(value) {
        this.alt.engineOn = value;
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

    // TODO: movable
    // TODO: mods

    get neonEnabled() {
        return this.alt.neon.back || this.alt.neon.front || this.alt.neon.left || this.alt.neon.right;
    }

    set neonEnabled(value) {
        this.alt.neon.left = value;
        this.alt.neon.right = value;
        this.alt.neon.front = value;
        this.alt.neon.back = value;
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
        this.alt.numberPlateType = value;
    }

    get pearlescentColor() {
        return this.alt.pearlColor;
    }

    set pearlescentColor(value) {
        this.alt.pearlColor = value;
    }

    // TODO: rocketBoost

    get rotation() {
        return new mp.Vector3(this.alt.rot.toDegrees());
    }

    set rotation(value) {
        this.alt.rot = new alt.Vector3(value).toRadians();
    }

    // TODO: siren
    // TODO: steerAngle
    // TODO: streamedPlayers
    // TODO: taxiLights
    // TODO: trailer
    // TODO: traileredBy
    // TODO: trimColor
    
    get velocity() {
        return this.alt.velocity;
    }

    set velocity(value) {
        this.alt.velocity = value;
    }

    get windowTint() {
        return this.alt.windowTint;
    }

    set windowTint(value) {
        this.alt.windowTint = value;
    }

    get wheelColor() {
        return this.alt.wheelColor;
    }

    set wheelColor(value) {
        this.alt.wheelColor = value;
    }

    get wheelType() {
        return this.alt.wheelType;
    }

    set wheelType(value) {
        this.alt.wheelType = value;
    }

    // TODO: alpha

    get model() {
        return this.alt.model;
    }

    set model(value) {
        this.alt.model = value;
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }

    get type() {
        return 'vehicle';
    }

    destroy() {
        this.alt.destroy();
    }

    // TODO: explode

    getColor(id) {
        return id == 0 ? this.alt.primaryColor : this.alt.secondaryColor;
    }

    getColorRGB(id) {
        // TODO: return null
        return id == 0 ? this.alt.customPrimaryColor : this.alt.customSecondaryColor;
    }

    getExtra(id) {
        return this.alt.getExtra(id);
    }

    getMod(id) {
        return this.alt.getMod(id);
    }

    // TODO: getNeonColor

    getOccupant(id) {
        // TODO: implement in core
        return alt.Player.all.find(p => p.vehicle === this.alt && p.seat === id);
    }

    getOccupants() {
        // TODO: implement in core
        return alt.Player.all.filter(p => p.vehicle === this.alt);
    }

    // TODO: getPaint

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
        this.alt.setExtra(extraId, !disabled);
    }

    setMod(type, index) {
        this.alt.setMod(type, index);
    }

    setNeonColor(r, g, b) {
        this.alt.neonColor = new alt.RGBA(r, g, b);
    }

    // TODO: setOccupant
    // TODO: setPaint
    
    spawn(pos, heading) {
        this.alt.pos = pos;
        this.alt.rot = new alt.Vector3(0, 0, heading * deg2rad);
    }
}

Object.defineProperty(alt.Vehicle.prototype, 'mp', { 
    get() {
        return this._mp ??= new _Vehicle(this);
    } 
});

mp.Vehicle = _Vehicle;

mp.vehicles = new Pool(() => alt.Vehicle.all);

mp.vehicles.at = function(id) {
    return alt.Vehicle.getByID(id)?.mp ?? null;
}

mp.vehicles.exists = function(id) {
    if (typeof id === 'object') return id.exists ?? id.mp?.exists;
    return this.Vehicle.getByID(id) != null;
}

mp.vehicles.new = function(model, position, options = {}) {
    const heading = options?.heading ?? 0;
    const veh = new alt.Vehicle(model, position, new alt.Vector3(0, 0, heading * deg2rad));
    if ('numberPlate' in options) veh.numberPlateText = options.numberPlate;
    // TODO: alpha
    if ('locked' in options) veh.mp.locked = options.locked;
    if ('engine' in options) veh.engineOn = options.engine;
    if ('dimension' in options) veh.dimension = options.dimension;
    if ('color' in options) {
        veh.customPrimaryColor = new alt.RGBA(options.color[0]);
        veh.customSecondaryColor = new alt.RGBA(options.color[1]);
    }
    return veh.mp;
}