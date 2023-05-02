import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { ClientPool } from '../ClientPool.js';
import { _WorldObject } from './WorldObject.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
export class _Blip extends _WorldObject {
    /** @param {alt.Blip} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get handle() {
        return this.alt.scriptID;
    }

    type = 'blip';

    setRotation(heading) {
        this.alt.heading = heading;
    }

    setAlpha(alpha) {
        this.alt.alpha = alpha;
    }

    getAlpha() {
        return this.alt.alpha;
    }

    destroy() {
        this.alt.destroy();
    }
}

Object.defineProperty(alt.Blip.prototype, 'mp', {
    get() {
        return this._mp ??= new _Blip(this);
    }
});

mp.Blip = _Blip;

mp.blips = new ClientPool(EntityGetterView.fromClass(alt.Blip));

mp.blips.new = function(sprite, position, params) {
    const blip = sprite === 9
        ? new alt.RadiusBlip(position.x, position.y, position.z, params.radius ?? 100)
        : new alt.PointBlip(position.x, position.y, position.z);
    if (sprite !== 9) blip.sprite = sprite;

    if ('name' in params) {
        blip.name = params.name;
        blip.gxtName = params.name;
    }
    if ('scale' in params) blip.scale = params.scale;
    if ('color' in params) blip.color = params.color;
    if ('alpha' in params) blip.alpha = params.alpha;
    // TODO: draw distance
    if ('shortRange' in params) blip.shortRange = params.shortRange;
    if ('rotation' in params) blip.heading = params.rotation;
    // TODO: dimension

    return blip.mp;
};
