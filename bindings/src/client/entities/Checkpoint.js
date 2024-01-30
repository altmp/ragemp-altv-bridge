import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {ClientPool} from '../ClientPool.js';
import {_BaseObject} from './BaseObject.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {internalName, mpDimensionToAlt} from '../../shared/utils';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {EntityMixedView} from '../../shared/pools/EntityMixedView';
import {EntityFilteredView} from '../../shared/pools/EntityFilteredView';

const store = new EntityStoreView();

export class _Checkpoint extends _BaseObject {
    /** @param {alt.Checkpoint} alt */
    constructor(alt) {
        super();
        this.alt = alt;
    }

    get id() {
        if (!this.alt.valid) return -1;
        return this.alt.id;
    }

    type = 'checkpoint';

    #visible = true;
    #lastColor;

    getColor() {
        return this.#lastColor;
    }

    setColor(color) {
        this.#lastColor = color;
        this.alt.color = this.#visible ? new alt.RGBA(color) : new alt.RGBA(0, 0, 0, 0);
    }

    get destination() {
        return new mp.Vector3(this.alt.nextPos);
    }

    set destination(pos) {
        this.alt.nextPos = pos;
    }

    get radius() {
        return this.alt.radius * 2;
    }

    set radius(value) {
        this.alt.radius = value / 2;
    }

    get height() {
        return this.alt.height;
    }

    set height(value) {
        this.alt.height = value;
    }

    get visible() {
        return this.#visible;
    }

    set visible(value) {
        this.#visible = value;
        this.alt.color = value ? new alt.RGBA(this.#lastColor) : new alt.RGBA(0, 0, 0, 0);
    }

    destroy() {
        if (!this.valid) return;

        if (this.alt.isPointIn(alt.Player.local.pos))
            mp.events.dispatchLocal('playerExitCheckpoint', this);

        this._markDestroyed();
        this.alt.destroy();
    }
}

export class _NetworkCheckpoint extends _Checkpoint {
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

    type = 'checkpoint';

    getColor() {
        return this.alt.getStreamSyncedMeta(internalName('color'));
    }

    setColor(color) {
    }

    get destination() {
        return new mp.Vector3(this.alt.getStreamSyncedMeta(internalName('nextPos')));
    }

    set destination(pos) {
    }

    get radius() {
        return this.alt.getStreamSyncedMeta(internalName('radius')) / 2;
    }

    set radius(value) {
    }

    get height() {
        return this.alt.getStreamSyncedMeta(internalName('height'));
    }

    set height(value) {
    }

    get visible() {
        return this.alt.getStreamSyncedMeta(internalName('visible'));
    }

    set visible(value) {
    }

    destroy() {
    }

    onDestroy() {
        store.remove(this.id, undefined, this.remoteId);
    }

    onCreate() {
        store.add(this, this.id, undefined, this.remoteId);
    }

    update(key, value) {
        if (!this.checkpoint) return;
        if (key === internalName('color')) {
            this.checkpoint.color = new alt.RGBA(value);
            this.checkpoint.iconColor = this.checkpoint.color;
        }
        else if (key === internalName('nextPos')) this.checkpoint.nextPos = value;
        else if (key === internalName('radius')) this.checkpoint.radius = value / 2;
        else if (key === internalName('height')) this.checkpoint.height = value;
        else if (key === internalName('dimension')) {
            this.alt.dimension = value;
            this.checkpoint.dimension = value;
        }
        else if (key === internalName('visible')) {
            this.checkpoint.color = value
                ? new alt.RGBA(this.getColor())
                : new alt.RGBA(0, 0, 0, 0);
            this.checkpoint.iconColor = this.checkpoint.color;
        }
    }

    streamIn() {
        const color = this.visible
            ? new alt.RGBA(this.getColor())
            : new alt.RGBA(0, 0, 0, 0);

        console.log('streaming in checkpoint', this.alt.pos);

        this.checkpoint = new alt.Checkpoint(
            this.alt.getStreamSyncedMeta(internalName('checkpointType')) ?? 0,
            this.alt.pos,
            this.destination,
            this.radius,
            this.height,
            color,
            color,
            mp.streamingDistance
        );
        this.checkpoint.dimension = this.alt.getStreamSyncedMeta(internalName('dimension')) ?? alt.globalDimension;
        this.checkpoint._network = true;
    }

    streamOut() {
        this.checkpoint.destroy();
    }
}

Object.defineProperty(alt.Checkpoint.prototype, 'mp', {
    get() {
        return this._mp ??= new _Checkpoint(this);
    }
});

mp.Checkpoint = _Checkpoint;

mp.checkpoints = new ClientPool(new EntityMixedView(store, new EntityFilteredView(EntityGetterView.fromClass(alt.Checkpoint), (e) => !e._network)));

mp.checkpoints.new = function (type, pos, radius, options = {}) {
    const color = options.color ? new alt.RGBA(...options.color) : alt.RGBA.red;
    const checkpoint = new alt.Checkpoint(type, pos, options.direction ?? new alt.Vector3(0, 0, 0), radius, 100, color, color, mp.streamingDistance);
    if ('dimension' in checkpoint) checkpoint.dimension = mpDimensionToAlt(options.dimension);
    return checkpoint.mp;
};

alt.on('entityEnterColshape', (shape, ent) => {
    if (ent !== alt.Player.local || !(shape instanceof alt.Checkpoint) || !shape) return;
    mp.events.dispatchLocal('playerEnterCheckpoint', shape.mp);
});

alt.on('entityLeaveColshape', (shape, ent) => {
    if (ent !== alt.Player.local || !(shape instanceof alt.Checkpoint) || !shape) return;
    mp.events.dispatchLocal('playerExitCheckpoint', shape.mp);
});
