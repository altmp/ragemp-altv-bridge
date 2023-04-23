import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { ClientPool } from '../ClientPool.js';
import { _WorldObject } from './WorldObject.js';
import { _Entity } from './Entity';
import {mpDimensionToAlt, deg2rad} from 'shared/utils';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';

export class _Marker extends _Entity {
    /** @param {alt.Marker} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    getColor() {
        return [ this.alt.color.r, this.alt.color.g, this.alt.color.b, this.alt.color.a ];
    }

    setColor(value) {
        this.alt.color = new alt.RGBA(value);
    }

    get scale() {
        return this.alt.scale.x;
    }

    set scale(value) {
        this.alt.scale = new alt.Vector3(value, value, value);
    }

    get direction() {
        return new mp.Vector3(this.alt.dir.x, this.alt.dir.y, this.alt.dir.z);
    }

    set direction(value) {
        this.alt.dir = new alt.Vector3(value.x, value.y, value.z);
    }

    get visible() {
        return this.alt.visible;
    }

    set visible(value) {
        this.alt.visible = value;
    }

    destroy() {
        this.alt.destroy();
    }

    type = 'marker';
}

Object.defineProperty(alt.Marker.prototype, 'mp', {
    get() {
        return this._mp ??= new _Marker(this);
    }
});

mp.Marker = _Marker;

mp.markers = new ClientPool(EntityGetterView.fromClass(alt.Marker));

mp.markers.new = function(type, position, scale, options) {
    let color = new alt.RGBA(0, 0, 0, 255);
    if ('color' in options) color = new alt.RGBA(options.color);
    const marker = new alt.Marker(type, position, color);
    if ('direction' in options) marker.dir = new alt.Vector3(options.direction.x, options.direction.y, options.direction.z);
    if ('rotation' in options) marker.rot = new alt.Vector3(options.rotation.x * deg2rad, options.rotation.y * deg2rad, options.rotation.z * deg2rad);
    if ('visible' in options) marker.visible = options.visible;
    if ('dimension' in options) marker.dimension = mpDimensionToAlt(options.dimension);
    marker.scale = new alt.Vector3(scale, scale, scale);
    return marker.mp;
};

alt.onServer(mp.prefix + 'toggleMarker', (id, toggle) => {
    alt.Marker.getByID(id).visible = toggle;
});
