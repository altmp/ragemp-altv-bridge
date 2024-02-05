import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {ClientPool} from '../ClientPool.js';
import {_Entity} from './Entity';
import {deg2rad, internalName, mpDimensionToAlt} from 'shared/utils';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {EntityMixedView} from '../../shared/pools/EntityMixedView';
import {EntityFilteredView} from '../../shared/pools/EntityFilteredView';

const store = new EntityStoreView();

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

    type = 'marker';
}

export class _NetworkMarker extends _Marker {
    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get id() {
        return this.alt.remoteID + 65536;
    }

    get remoteId() {
        return this.alt.remoteID + 65536;
    }

    destroy() {}

    get rotation() {
        return new mp.Vector3(this.alt.getStreamSyncedMeta(internalName('rotation')) ?? alt.Vector3.zero);
    }
    set rotation(value) {}

    get direction() {
        return new mp.Vector3(this.alt.getStreamSyncedMeta(internalName('direction')) ?? alt.Vector3.zero);
    }
    set direction(value) {}

    getColor() {
        const rgba = this.alt.getStreamSyncedMeta(internalName('color')) ?? alt.RGBA.white;
        return [ rgba.r, rgba.g, rgba.b, rgba.a ];
    }
    setColor(value) {}

    get scale() {
        return this.alt.getStreamSyncedMeta(internalName('scale')) ?? 1;
    }
    set scale(value) {}

    get visible() {
        return this.alt.getStreamSyncedMeta(internalName('visible')) ?? true;
    }
    set visible(value) {}

    type = 'marker';

    posChange() {
        this.marker.pos = this.alt.pos;
    }
    onDestroy() {
        store.remove(this.id, undefined, this.remoteId);
    }
    onCreate() {
        store.add(this, this.id, undefined, this.remoteId);
    }
    update(key, value) {
        if (!this.marker) return;
        if (key === (internalName('rotation'))) {
            this.marker.rot = value ?? alt.Vector3.zero;
        }
        if (key === (internalName('direction'))) {
            this.marker.dir = value ?? alt.Vector3.zero;
        }
        if (key === (internalName('color'))) {
            this.marker.color = value ?? alt.RGBA.white;
        }
        if (key === (internalName('scale'))) {
            const scale = value ?? 1;
            this.marker.scale = new alt.Vector3(scale, scale, scale);
        }
        if (key === (internalName('visible'))) {
            this.marker.visible = value ?? true;
        }
    }
    streamIn() {
        this.marker = new alt.Marker(
            this.alt.getStreamSyncedMeta(internalName('markerType')) ?? 0,
            this.alt.pos,
            this.alt.getStreamSyncedMeta(internalName('color')) ?? alt.RGBA.white,
            false,
            0
        );
        this.marker._network = true;
        this.marker.faceCamera = true;
    }
    streamOut() {
        this.marker.destroy();
    }
}

Object.defineProperty(alt.Marker.prototype, 'mp', {
    get() {
        return this._mp ??= new _Marker(this);
    }
});

mp.Marker = _Marker;

mp.markers = new ClientPool(
    new EntityMixedView(store, new EntityFilteredView(EntityGetterView.fromClass(alt.Marker), (e) => !e._network)),
    [_Marker, _NetworkMarker]
);

mp.markers.new = function(type, position, scale, options = {}) {
    let color = alt.RGBA.white;
    if ('color' in options) color = new alt.RGBA(options.color);
    const marker = new alt.Marker(type, position, color, true, mp.streamingDistance);
    marker.faceCamera = true;
    if ('direction' in options) marker.dir = new alt.Vector3(options.direction.x, options.direction.y, options.direction.z);
    if ('rotation' in options) marker.rot = new alt.Vector3(options.rotation.x * deg2rad, options.rotation.y * deg2rad, options.rotation.z * deg2rad);
    if ('visible' in options) marker.visible = options.visible;
    if ('dimension' in options) marker.dimension = mpDimensionToAlt(options.dimension);
    marker.scale = new alt.Vector3(scale, scale, scale);
    return marker.mp;
};

if (mp._main) {
    alt.onServer(internalName('toggleMarker'), (id, toggle) => {
        const el = store.getByRemoteID(id);
        if (el && el.marker) el.marker.visible = toggle;
    });
}
