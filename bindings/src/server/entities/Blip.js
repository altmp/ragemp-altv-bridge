import * as alt from 'alt-server';
import { SyncedMetaProxy } from '../../shared/meta.js';
import mp from '../../shared/mp.js';
import {mpDimensionToAlt, deg2rad, rad2deg, vdist, vdist2} from '../../shared/utils.js';
import { _Entity } from './Entity.js';
import { _WorldObject } from './WorldObject.js';
import { ServerPool } from '../pools/ServerPool';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';

export class _Blip extends _WorldObject {
    alt;

    /** @param {alt.Blip} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        this.data = new SyncedMetaProxy(alt);
    }

    get alpha() {
        return this.alt.alpha;
    }

    set alpha(value) {
        this.alt.alpha = value;
    }

    get color() {
        return this.alt.color;
    }

    set color(value) {
        this.alt.color = value;
    }

    // TODO: drawDistance??

    get name() {
        return this.alt.name;
    }

    set name(value) {
        this.alt.name = value;
    }

    get rotation() {
        return this.alt.heading;
    }

    set rotation(value) {
        this.alt.heading = value;
    }

    get scale() {
        return this.alt.scale;
    }

    set scale(value) {
        this.alt.scale = value;
    }

    get shortRange() {
        return this.alt.shortRange;
    }

    set shortRange(value) {
        this.alt.shortRange = value;
    }

    get model() {
        return 0;
    }

    set model(_) {
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }

    type = 'blip';

    // TODO: routeFor
    // TODO: unrouteFor
}

Object.defineProperty(alt.Blip.prototype, 'mp', {
    get() {
        return this._mp ??= new _Blip(this);
    }
});

mp.Blip = _Blip;

mp.blips = new ServerPool(EntityGetterView.fromClass(alt.Blip));

mp.blips.new = function(sprite, position, options) {
    const blip = new alt.PointBlip(new alt.Vector3(position.x, position.y, position.z));

    blip.sprite = sprite;
    if ('name' in options) blip.name = options.name;
    if ('scale' in options) blip.scale = options.scale;
    if ('color' in options) blip.color = options.color;
    if ('alpha' in options) blip.alpha = options.alpha;
    // TODO: drawDistance?
    if ('shortRange' in options) blip.shortRange = options.shortRange;
    if ('rotation' in options) blip.heading = options.rotation; // TODO: convert units?
    if ('dimension' in options) blip.dimension = mpDimensionToAlt(options.dimension);
    // TODO: radius
    return blip.mp;
};
