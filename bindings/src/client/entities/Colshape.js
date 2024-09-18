import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { ClientPool } from '../pools/ClientPool.js';
import { _Entity } from './Entity';
import { _WorldObject } from './WorldObject';
import { _BaseObject } from './BaseObject';
import { EntityGetterView } from '../../shared/pools/EntityGetterView';
import { getValidXYZ, internalName, mpDimensionToAlt } from '../../shared/utils';
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

    get position() {
        if (!this.valid) return mp.Vector3.zero;
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        if (!this.valid) return;
        this.alt.pos = value;
    }

    type = 'colshape';

    destroy() {
        if (!this.valid) return;

        if (this.alt.isPointIn(alt.Player.local.pos))
            mp.events.dispatchLocal('playerExitColshape', this);

        this._markDestroyed();
        this.alt.destroy();
    }
}

// TODO: server colshape getter

Object.defineProperty(alt.Colshape.prototype, 'mp', {
    get() {
        return this._mp ??= new _Colshape(this);
    }
});

class _FakeColshape {
}

mp.Colshape = _Colshape;

mp.colshapes = new ClientPool(EntityGetterView.fromClass(alt.Colshape, [BaseObjectType.Colshape]), [_Colshape, _FakeColshape]);

mp.colshapes.newCircle = function(x, y, radius, dimension = 0) {
    const shape = new alt.ColshapeCircle(x, y, radius);
    shape.dimension = mpDimensionToAlt(dimension);
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newSphere = function(x, y, z, range, dimension = 0) {
    const validXYZ = getValidXYZ(x, y, z);
    const shape = new alt.ColshapeSphere(validXYZ.x, validXYZ.y, validXYZ.z, range);
    shape.dimension = mpDimensionToAlt(dimension);
    shape.playersOnly = true;
    return shape.mp;
};

mp.colshapes.newCuboid = function(x, y, z, width, depth, height, dimension = 0) {
    const validXYZ = getValidXYZ(x, y, z);
    const shape = new alt.ColshapeCuboid(validXYZ.x - width / 2, validXYZ.y - depth / 2, validXYZ.z - height / 2, validXYZ.x + width / 2, validXYZ.y + depth / 2, validXYZ.z + height / 2);
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
    const validXYZ = getValidXYZ(x, y, z);
    const shape = new alt.ColshapeCylinder(validXYZ.x, validXYZ.y, validXYZ.z, range, height);
    shape.dimension = mpDimensionToAlt(dimension);
    shape.playersOnly = true;
    return shape.mp;
};

alt.on('entityEnterColshape', (shape, ent) => {
    if (!(ent instanceof alt.Player) || shape instanceof alt.Checkpoint || !shape) return;
    mp.events.dispatchLocal('playerEnterColshape', shape.mp);
});

alt.on('entityLeaveColshape', (shape, ent) => {
    if (!(ent instanceof alt.Player) || shape instanceof alt.Checkpoint || !shape) return;
    mp.events.dispatchLocal('playerExitColshape', shape.mp);
});

const serverColshapeCache = new Map();

function getServerColshape(id, position, dimension, type, meta) {
    const obj = serverColshapeCache.get(id) ?? new _FakeColshape();
    Object.assign(obj, {
        position: new mp.Vector3(position),
        dimension,
        id: id + 65535,
        remoteId: id,
        shapeType: type,
        getVariable(key) {
            return meta[key];
        },
        hasVariable(key) {
            return key in meta;
        },
        isPointWithin() {
            return false;
        },
        valid: true,
        _passAsIs: true,
        _isColshape: true
    });
    serverColshapeCache.set(id, obj);
    return obj;
}

alt.onServer(internalName('enterColshape'), (id, position, dimension, type, meta) => {
    mp.events.dispatchLocal('playerEnterColshape', getServerColshape(id, position, dimension, type, meta));
});

alt.onServer(internalName('leaveColshape'), (id, position, dimension, type, meta) => {
    mp.events.dispatchLocal('playerExitColshape', getServerColshape(id, position, dimension, type, meta));
});
