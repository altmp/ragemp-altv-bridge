import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { Pool } from '../Pool.js';
import { _BaseObject } from './BaseObject.js';

const created = {};
let list = [];
let lastId = 0;

export class _Checkpoint extends _BaseObject {
    #alt;
    id;

    /** @param {alt.Checkpoint} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
        this.id = lastId++;
        created[this.id] = this;
        list = Object.values(created);
    }

    get type() {
        return 'checkpoint';
    }

    destroy() {
        this.#alt.destroy();
        delete created[this.id];
        list = Object.values(created);
    }
}

Object.defineProperty(alt.Checkpoint.prototype, 'mp', { 
    get() {
        return this._mp ??= new _Checkpoint(this);
    }
});

mp.Checkpoint = _Checkpoint;

mp.checkpoints = new Pool(() => list, () => list, (id) => created[id]);

mp.checkpoints.new = function(type, pos, radius, options) {
    // TODO: height?
    // TODO: visible
    const checkpoint = new alt.Checkpoint(type, pos, options.nextPos ?? new alt.Vector3(0, 0, 0), radius, 100, options.color ? new alt.RGBA(...options.color) : alt.RGBA.red);
    return checkpoint.mp;
}