import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_WorldObject} from './WorldObject';
import { ServerPool } from '../pools/ServerPool';
import { getValidXYZ, toAlt, toMp } from '../../shared/utils';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {emitClientInternal} from '../serverUtils';
import {BaseObjectType} from '../../shared/BaseObjectType';

const colshapeTypes = {
    0: 'sphere',
    1: 'tube',
    2: 'circle',
    3: 'cuboid',
    4: 'rectangle',
    5: 'checkpoint',
    6: 'polygon'
};

export class _Colshape extends _WorldObject {
    alt;

    /** @param {alt.Colshape} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    type = 'colshape';

    isPointWithin(pos) {
        return this.alt.isPointIn(pos);
    }

    get shapeType() {
        return colshapeTypes[this.alt.colshapeType];
    }

    setVariable(key, value) {
        this.alt.setMeta(key, toAlt(value));
    }

    hasVariable(key) {
        return this.alt.hasMeta(key);
    }

    getVariable(key) {
        if (!this.hasVariable(key)) return undefined;
        return toMp(this.alt.getMeta(key));
    }

    destroy() {
        if (!this.valid) return;

        // const players = alt.Player.all;
        // const length = players.length;
        // for (let i = 0; i < length; i++) {
        //     const player = players[i];
        //     if (this.alt.isPointIn(player.pos))
        //         leaveColshape(this.alt, player);
        // }

        this._markDestroyed();
        this.alt.destroy();
    }
}

Object.defineProperty(alt.Colshape.prototype, 'mp', {
    get() {
        return this._mp ??= new _Colshape(this);
    }
});

mp.Colshape = _Colshape;

mp.colshapes = new ServerPool(EntityGetterView.fromClass(alt.Colshape, [BaseObjectType.Colshape]), [_Colshape]);

mp.colshapes.newCircle = function(x, y, radius, dimension = 0) {
    const shape = new alt.ColshapeCircle(x, y, radius);
    shape.mp.dimension = dimension;
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newSphere = function(x, y, z, range, dimension = 0) {
    const validXYZ = getValidXYZ(x, y, z);
    const shape = new alt.ColshapeSphere(validXYZ.x, validXYZ.y, validXYZ.z, range);
    shape.mp.dimension = dimension;
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newCuboid = function(x, y, z, width, depth, height, dimension = 0) {
    const validXYZ = getValidXYZ(x, y, z);
    const shape = new alt.ColshapeCuboid(validXYZ.x - width / 2, validXYZ.y - depth / 2, validXYZ.z - height / 2, validXYZ.x + width / 2, validXYZ.y + depth / 2, validXYZ.z + height / 2);
    shape.mp.dimension = dimension;
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newRectangle = function(x, y, width, height, dimension = 0) {
    const shape = new alt.ColshapeRectangle(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
    shape.mp.dimension = dimension;
    shape.playersOnly = true;
    return shape.mp;
};

// RAGE MP docs don't have dimension arg here wtf
mp.colshapes.newTube = function(x, y, z, height, range, dimension = 0) {
    const validXYZ = getValidXYZ(x, y, z);
    const shape = new alt.ColshapeCylinder(validXYZ.x, validXYZ.y, validXYZ.z, range, height);
    shape.mp.dimension = dimension;
    shape.playersOnly = true;
    return shape.mp;
};

function enterColshape(shape, ent) {
    if (!(ent instanceof alt.Player) || !shape || !(shape.mp instanceof _Colshape)) return;
    mp.events.dispatchLocal('playerEnterColshape', ent.mp, shape.mp);
    const keys = shape.getMetaDataKeys();
    emitClientInternal(ent, 'enterColshape', shape.id, shape.pos, shape.dimension, shape.mp.shapeType, Object.fromEntries(keys.map(e => [e, shape.getMeta(e)])));
}

alt.on('entityEnterColshape', enterColshape);

function leaveColshape(shape, ent) {
    if (!(ent instanceof alt.Player) || !shape || !(shape.mp instanceof _Colshape)) return;
    mp.events.dispatchLocal('playerExitColshape', ent.mp, shape.mp);
    const keys = shape.getMetaDataKeys();
    emitClientInternal(ent, 'leaveColshape', shape.id, shape.pos, shape.dimension, shape.mp.shapeType, Object.fromEntries(keys.map(e => [e, shape.getMeta(e)])));
}

alt.on('entityLeaveColshape', leaveColshape);
