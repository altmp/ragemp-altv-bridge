import * as alt from "alt-client";
import * as natives from "natives";
import mp from "../../shared/mp.js";

export class _Vehicle {
    #alt;

    /** @param {alt.Vehicle} alt */
    constructor(alt) {
        this.#alt = alt;
    }

    get handle() {
        return this.#alt.scriptID;
    }

    get id() {
        return this.#alt.id;
    }

    get remoteId() {
        return this.#alt.remoteId;
    }

    get position() {
        return new mp.Vector3(this.#alt.position);
    }

    get gear() {
        return this.#alt.gear;
    }

    get rpm() {
        return this.#alt.rpm;
    }

    // TODO: reverse and implement steeringAngle in core
    // TODO: nosActive (nitro)
    // TODO: nosAmount (nitro)
    // TODO: getHandling
    // TODO: getDefaultHandling

    get wheelCount() {
        return this.#alt.wheelsCount;
    }

    get type() {
        return "vehicle";
    }
}

Object.defineProperty(alt.Vehicle.prototype, "mp", { 
    get() {
        return this._mp ??= new _Vehicle(this);
    } 
});

mp.Vehicle = _Vehicle;

mp.vehicles = {};

mp.vehicles.at = function(id) {
    return alt.Vehicle.getByID(id)?.mp ?? null;
}

mp.vehicles.atHandle = function(handle) {
    return alt.Vehicle.getByScriptID(handle)?.mp ?? null;
}

mp.vehicles.exists = function(id) {
    return alt.Vehicle.getByID(id) != null;
}

mp.vehicles.forEach = function(fn) {
    alt.Vehicle.all.forEach((vehicle) => fn(vehicle, vehicle.id));
}

mp.players.apply = mp.players.forEach;

mp.players.forEachInStreamRange = function(fn) {
    alt.Vehicle.streamedIn.forEach((vehicle) => fn(vehicle, vehicle.id));
}

mp.players.toArray = function() {
    return alt.Vehicle.all;
}

// TODO: atRemoteId
// TODO: remoteId
// TODO: maxStreamed