import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { Pool } from '../Pool.js';
import { _WorldObject } from './WorldObject.js';

export class _Blip extends _WorldObject {
    #alt;

    /** @param {alt.Blip} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
    }

    get handle() {
        return this.#alt.scriptID;
    }

    get type() {
        return 'blip';
    }
}

Object.defineProperty(alt.Blip.prototype, 'mp', { 
    get() {
        return this._mp ??= new _Blip(this);
    } 
});

mp.Blip = _Blip;

mp.blips = new Pool(() => alt.Blip.all, () => alt.Blip.all, alt.Blip.getByID);

mp.blips.new = function(sprite, position, params) {
    const blip = new alt.PointBlip(position.x, position.y, position.z);
    blip.sprite = sprite;
    if ('name' in params) blip.name = params.name;
    if ('scale' in params) blip.scale = params.scale;
    if ('color' in params) blip.color = params.color;
    if ('alpha' in params) blip.alpha = params.alpha;
    // TODO: draw distance
    if ('shortRange' in params) blip.shortRange = params.shortRange;
    if ('rotation' in params) blip.heading = params.rotation; // TODO: deg or rad
    // TODO: dimension
    // TODO: radius
}
