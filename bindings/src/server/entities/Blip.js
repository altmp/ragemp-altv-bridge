import * as alt from 'alt-server';
import { SyncedMetaProxy } from '../../shared/meta.js';
import mp from '../../shared/mp.js';
import {mpDimensionToAlt, deg2rad, rad2deg, vdist, vdist2} from '../../shared/utils.js';
import { _Entity } from './Entity.js';
import { _WorldObject } from './WorldObject.js';
import { ServerPool } from '../pools/ServerPool';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {BaseObjectType} from '../../shared/BaseObjectType';

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

mp.blips = new ServerPool(EntityGetterView.fromClass(alt.Blip, [BaseObjectType.Blip]));

mp.blips.new = function(sprite, position, params = {}) {
    const blip = new alt.PointBlip(new alt.Vector3(position.x, position.y, position.z), true);

    blip.sprite = sprite;
    if ('name' in params) blip.name = params.name;
    if ('scale' in params) blip.scale = params.scale;
    if ('color' in params) blip.color = params.color;
    if ('alpha' in params) blip.alpha = params.alpha;
    // TODO: drawDistance?
    if ('shortRange' in params) blip.shortRange = params.shortRange;
    if ('rotation' in params) blip.heading = params.rotation; // TODO: convert units?
    blip.mp.dimension = params.dimension ?? 0;
    // TODO: radius
    return blip.mp;
};
