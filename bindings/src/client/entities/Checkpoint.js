import * as alt from "alt-client";
import mp from "../../shared/mp.js";

const created = {};
let list = [];
let lastId = 0;

export class _Checkpoint {
    #alt;
    id;

    /** @param {alt.Checkpoint} alt */
    constructor(alt) {
        this.#alt = alt;
        this.#_url = alt.url;
        this.id = lastId++;
        created[this.id] = this;
        list = Object.values(created);
    }

    get type() {
        return "checkpoint";
    }

    destroy() {
        this.#alt.destroy();
        delete created[this.id];
        list = Object.values(created);
    }
}

Object.defineProperty(alt.Checkpoint.prototype, "mp", { 
    get() {
        return this._mp ??= new _Checkpoint(this);
    }
});

mp.Checkpoint = _Checkpoint;

mp.checkpoints = {};

Object.defineProperties(mp.checkpoints, "length", {
    get() {
        return list.length;
    }
});

// TODO: size
// TODO: maxStreamed

mp.checkpoints.new = function(type, pos, radius, options) {
    // TODO: height?
    // TODO: visible
    const checkpoint = new alt.Checkpoint(type, pos, options.nextPos ?? new alt.Vector3(0, 0, 0), radius, 100, options.color ? new alt.RGBA(...options.color) : alt.RGBA.red);
    return checkpoint.mp;
}

mp.checkpoints.toArray = function() {
    return list;
}

mp.checkpoints.forEach = function(fn) {
    list.forEach(checkpoint => fn(checkpoint, checkpoint.id));
}

mp.checkpoints.apply = mp.checkpoints.forEach;

mp.checkpoints.exists = function(id) {
    return id in created;
}

mp.checkpoints.at = function(id) {
    return created[id] ?? null;
}

mp.checkpoints.atRemoteId = function(id) {
    return mp.checkpoints.at(id);
}