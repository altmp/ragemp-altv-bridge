import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_WorldObject} from './WorldObject';
import {_Colshape} from './Colshape';
import { ServerPool } from '../pools/ServerPool';
import {
    altDimensionToMp,
    internalName,
    mpDimensionToAlt,
    TemporaryContainer,
    TickCacheContainer
} from '../../shared/utils';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {_Entity} from './Entity';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';

const view = new EntityStoreView();

export class _Checkpoint extends _Entity {
    /** @type {alt.Colshape} alt */
    colshape;

    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        view.add(this, this.id);
    }

    type = 'checkpoint';


    #positionCache = new TickCacheContainer();
    get position() {
        return this.#positionCache.get(() => new mp.Vector3(this.alt.pos));
    }
    set position(value) {
        this.#positionCache.set(value);
        this.alt.pos = this.colshape.pos = new alt.Vector3(value);
    }

    get dimension() {
        return super.dimension;
    }

    set dimension(value) {
        this.colshape.dimension = mpDimensionToAlt(value);
        super.dimension = value;
    }

    #color;
    getColor() {
        return this.#color;
    }

    setColor(color) {
        this.#color = color;
        this.alt.setStreamSyncedMeta(internalName('color'), color);
    }

    #destination;
    get destination() {
        return this.#destination;
    }

    set destination(pos) {
        this.#destination = pos;
        this.alt.setStreamSyncedMeta(internalName('nextPos'), pos);
    }

    #radius;
    get radius() {
        return this.#radius;
    }
    set radius(value) {
        this.#radius = value;
        this.alt.setStreamSyncedMeta(internalName('radius'), value);
    }

    #height;
    get height() {
        return this.#height;
    }
    set height(value) {
        this.#height = value;
        this.alt.setStreamSyncedMeta(internalName('height'), value);
    }

    #visible;
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

        const players = alt.Player.all;
        const length = players.length;
        for (let i = 0; i < length; i++) {
            const player = players[i];
            if (this.colshape.isPointIn(player.pos))
                mp.events.dispatchLocal('playerExitCheckpoint', player.mp, this);
        }

        this._markDestroyed();
        this.alt.destroy();
        this.colshape.destroy();
    }
}

mp.Checkpoint = _Checkpoint;

mp.checkpoints = new ServerPool(view, [_Checkpoint]);

const group = new alt.VirtualEntityGroup(50);

mp.checkpoints.new = function(type, position, radius, params = {}) {
    const virtualEnt = new alt.VirtualEntity(group, position, mp.streamingDistance);
    virtualEnt.setStreamSyncedMeta(internalName('type'), VirtualEntityID.Checkpoint);
    virtualEnt.setStreamSyncedMeta(internalName('checkpointType'), type);

    const ent = virtualEnt.mp;
    ent.radius = radius;

    ent.colshape = new alt.ColshapeCylinder(
        position.x,
        position.y,
        position.z,
        ent.radius / 2,
        ent.height
    );
    ent.colshape.dimension = alt.globalDimension;
    ent.colshape._mp = ent;

    ent.height = params.height ?? 100;
    ent.visible = params.visible ?? true;
    ent.dimension = params.dimension ?? 0;
    ent.setColor(params.color ?? [255, 255, 255, 255]);
    ent.destination = params.direction ?? new alt.Vector3(0, 0, 0);

    return ent;
};

alt.on('entityEnterColshape', (shape, ent) => {
    if (ent.type !== alt.BaseObjectType.Player || !shape || !(shape.mp instanceof _Checkpoint)) return;
    mp.events.dispatchLocal('playerEnterCheckpoint', ent.mp, shape.mp);
});

alt.on('entityLeaveColshape', (shape, ent) => {
    if (ent.type !== alt.BaseObjectType.Player || !shape || !(shape.mp instanceof _Checkpoint)) return;
    mp.events.dispatchLocal('playerExitCheckpoint', ent.mp, shape.mp);
});

alt.on('baseObjectRemove', (ent) => {
    if (!ent?.mp) return;
    if (ent.mp instanceof _Checkpoint) view.remove(ent.mp.id);
});
