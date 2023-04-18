import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { ClientPool } from '../ClientPool.js';
import { _BaseObject } from './BaseObject.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {mpDimensionToAlt} from '../../shared/utils';

const colshapeTypes = {
    0: 'sphere',
    1: 'tube',
    2: 'circle',
    3: 'cuboid',
    4: 'rectangle',
    5: 'checkpoint',
    6: 'polygon'
};

export class _Colshape extends _BaseObject {
    /** @param {alt.Colshape} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    isPointWithin(pos) {
        return this.alt.isPointIn(pos);
    }

    get shapeType() {
        return colshapeTypes[this.alt.colshapeType];
    }
}

Object.defineProperty(alt.Colshape.prototype, 'mp', {
    get() {
        return this._mp ??= new _Colshape(this);
    }
});

mp.Colshape = _Colshape;

mp.colshapes = new ClientPool(EntityGetterView.fromClass(alt.Colshape));

mp.colshapes.newCircle = function(x, y, radius, dimension = 0) {
    const shape = new alt.ColshapeCircle(x, y, radius);
    shape.dimension = mpDimensionToAlt(dimension);
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newSphere = function(x, y, z, range, dimension = 0) {
    const shape = new alt.ColshapeSphere(x, y, z, range);
    shape.dimension = mpDimensionToAlt(dimension);
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newCuboid = function(x, y, z, width, depth, height, dimension = 0) {
    const shape = new alt.ColshapeCuboid(x - width / 2, y - depth / 2, z - height / 2, x + width / 2, y + depth / 2, z + height / 2);
    shape.dimension = mpDimensionToAlt(dimension);
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newRectangle = function(x, y, width, height, dimension = 0) {
    const shape = new alt.ColshapeRectangle(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
    shape.dimension = mpDimensionToAlt(dimension);
    shape.playersOnly = true;
    return shape.mp;
};

// RAGE MP docs don't have dimension arg here wtf
mp.colshapes.newTube = function(x, y, z, height, range, dimension = 0) {
    const shape = new alt.ColshapeCylinder(x, y, z, range, height);
    shape.dimension = mpDimensionToAlt(dimension);
    shape.playersOnly = true;
    return shape.mp;
};

alt.on('entityEnterColshape', (shape, ent) => {
    if (!(ent instanceof alt.Player) || shape instanceof alt.Checkpoint) return;
    mp.events.dispatch('playerEnterColshape', ent.mp, shape.mp);
});

alt.on('entityLeaveColshape', (shape, ent) => {
    if (!(ent instanceof alt.Player) || shape instanceof alt.Checkpoint) return;
    mp.events.dispatch('playerExitColshape', ent.mp, shape.mp);
});
