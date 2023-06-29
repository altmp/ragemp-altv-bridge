import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_WorldObject} from './WorldObject';
import { ServerPool } from '../pools/ServerPool';
import {mpDimensionToAlt, toAlt, toMp} from '../../shared/utils';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';

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
        return toMp(this.alt.getMeta(key));
    }

    destroy() {
        if (!this.alt.valid) return;

        for (let player of alt.Player.all) {
            if (this.alt.isPointIn(player.pos))
                leaveColshape(this.alt, player);
        }

        this.alt.destroy();
    }
}

Object.defineProperty(alt.Colshape.prototype, 'mp', {
    get() {
        return this._mp ??= new _Colshape(this);
    }
});

mp.Colshape = _Colshape;

mp.colshapes = new ServerPool(EntityGetterView.fromClass(alt.Colshape));

mp.colshapes.newCircle = function(x, y, radius, dimension = 0) {
    const shape = new alt.ColshapeCircle(x, y, radius);
    shape.mp.dimension = dimension;
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newSphere = function(x, y, z, range, dimension = 0) {
    const shape = new alt.ColshapeSphere(x, y, z, range);
    shape.mp.dimension = dimension;
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newCuboid = function(x, y, z, width, depth, height, dimension = 0) {
    const shape = new alt.ColshapeCuboid(x - width / 2, y - depth / 2, z - height / 2, x + width / 2, y + depth / 2, z + height / 2);
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
    const shape = new alt.ColshapeCylinder(x, y, z, range, height);
    shape.mp.dimension = dimension;
    shape.playersOnly = true;
    return shape.mp;
};

function enterColshape(shape, ent) {
    if (!(ent instanceof alt.Player) || shape instanceof alt.Checkpoint || !shape) return;
    mp.events.dispatch('playerEnterColshape', ent.mp, shape.mp);
    const keys = shape.getMetaDataKeys();
    ent.emit(mp.prefix + 'enterColshape', shape.pos, shape.dimension, shape.mp.shapeType, Object.fromEntries(keys.map(e => [e, shape.getMeta(e)])));
}

alt.on('entityEnterColshape', enterColshape);

function leaveColshape(shape, ent) {
    if (!(ent instanceof alt.Player) || shape instanceof alt.Checkpoint || !shape) return;
    mp.events.dispatch('playerExitColshape', ent.mp, shape.mp);
    const keys = shape.getMetaDataKeys();
    ent.emit(mp.prefix + 'leaveColshape', shape.pos, shape.dimension, shape.mp.shapeType, Object.fromEntries(keys.map(e => [e, shape.getMeta(e)])));
}

alt.on('entityLeaveColshape', leaveColshape);
