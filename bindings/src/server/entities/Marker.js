import * as alt from 'alt-server';
import {StreamSyncedMetaProxy, SyncedMetaProxy} from '../../shared/meta.js';
import mp from '../../shared/mp.js';
import {deg2rad, internalName, mpDimensionToAlt} from '../../shared/utils.js';
import { _Entity } from './Entity.js';
import { _WorldObject } from './WorldObject.js';
import { ServerPool } from '../pools/ServerPool';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {emitClientInternal} from '../serverUtils';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {_Object} from './Object';
import {VirtualEntityID} from '../../shared/VirtualEntityID';

const view = new EntityStoreView();

export class _Marker extends _Entity {
    alt;

    /** @param {alt.Marker} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        view.add(this, this.id);
        this.data = new StreamSyncedMetaProxy(alt);
    }

    get id() {
        return this.alt.id + 65536;
    }

    type = 'marker';

    get setVariable() {
        return this.setStreamVariable;
    }

    get getVariable() {
        return this.getStreamVariable;
    }

    get hasVariable() {
        return this.hasStreamVariable;
    }

    showFor(player) {
        emitClientInternal(player.alt, 'toggleMarker', this.id, true);
    }

    hideFor(player) {
        emitClientInternal(player.alt, 'toggleMarker', this.id, false);
    }

    #color = [255, 255, 255, 255];
    setColor(value) {
        this.#color = value;
        this.alt.setStreamSyncedMeta(internalName('color'), new alt.RGBA(value));
    }
    getColor() {
        return this.#color;
    }

    #scale = 1;
    get scale() {
        return this.#scale;
    }
    set scale(value) {
        this.#scale = value;
        this.alt.setStreamSyncedMeta(internalName('scale'), value);
    }

    #direction = mp.Vector3.zero;
    get direction() {
        return this.#direction;
    }

    set direction(value) {
        this.#direction = value;
        this.alt.setStreamSyncedMeta(internalName('direction'), new alt.Vector3(value.x, value.y, value.z));
    }

    #rotation = mp.Vector3.zero;
    get rotation() {
        return this.#rotation;
    }

    set rotation(value) {
        this.#rotation = value;
        this.alt.setStreamSyncedMeta(internalName('rotation'), new alt.Vector3(value.x, value.y, value.z));
    }

    #visible = true;
    get visible() {
        return this.#visible;
    }

    set visible(value) {
        this.#visible = value;
        this.alt.setStreamSyncedMeta(internalName('visible'), value);
    }

    destroy() {
        if (!this.valid) return;
        view.remove(this.id);
        super.destroy();
    }
}

alt.on('baseObjectRemove', (ent) => {
    if (!ent?.mp) return;
    if (ent.mp instanceof _Object) view.remove(ent.mp.id);
});

// Object.defineProperty(alt.Marker.prototype, 'mp', {
//     get() {
//         return this._mp ??= new _Marker(this);
//     }
// });

mp.Marker = _Marker;

mp.markers = new ServerPool(view, [_Marker]);

const group = new alt.VirtualEntityGroup(128);
mp.markers.new = function(type, position, scale, options = {}) {
    const virtualEnt = new alt.VirtualEntity(group, position, options.drawDistance ?? mp.streamingDistance);
    virtualEnt.setStreamSyncedMeta(internalName('type'), VirtualEntityID.Marker);
    virtualEnt.setStreamSyncedMeta(internalName('markerType'), type);
    const ent = virtualEnt.mp;
    if ('color' in options) ent.setColor(options.color);
    if ('direction' in options) ent.direction = options.direction;
    if ('rotation' in options) ent.rotation = options.rotation;
    if ('visible' in options) ent.visible = options.visible;
    if ('dimension' in options) ent.dimension = options.dimension;
    ent.scale = scale;
    return ent;
};
