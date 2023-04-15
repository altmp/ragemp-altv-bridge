import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { Pool } from '../Pool.js';
import { _BaseObject } from './BaseObject.js';

export class _Colshape extends _BaseObject {
    /** @param {alt.Checkpoint} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    getVariable() {
        return null;
    }

    setVariable() {

    }

    setVariables() {

    }

    hasVariable() {
        return false;
    }
}

mp.Colshape = _Colshape;

mp.colshapes = new Pool(() => [], () => [], (id) => null);

mp.colshapes.new = function(type, pos, radius, options) {
    return new _Colshape({});
};

mp.colshapes.newCircle = function(type, pos, radius, options) {
    return new _Colshape({});
};

mp.colshapes.newSphere = function(type, pos, radius, options) {
    return new _Colshape({});
};

mp.colshapes.newCuboid = function(type, pos, radius, options) {
    return new _Colshape({});
};

mp.colshapes.newRectangle = function(type, pos, radius, options) {
    return new _Colshape({});
};

mp.colshapes.newTube = function(type, pos, radius, options) {
    return new _Colshape({});
};
