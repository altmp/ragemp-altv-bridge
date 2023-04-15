import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_WorldObject} from './WorldObject';
import {_Colshape} from './Colshape';
import { Pool } from '../pools/Pool';
import {mpDimensionToAlt} from '../../shared/utils';

export class _Checkpoint extends _Colshape {
    /** @param {alt.Colshape} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        // this.#lastColor = alt.color.toArray();
    }

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
        return this.alt.radius;
    }

    set radius(value) {
        this.alt.radius = value;
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
}

Object.defineProperty(alt.Checkpoint.prototype, 'mp', {
    get() {
        return this._mp ??= new _Checkpoint(this);
    }
});

mp.Checkpoint = _Checkpoint;

mp.checkpoints = new Pool(() => alt.Checkpoint.all, alt.Checkpoint.getByID, () => alt.Checkpoint.all.length);

mp.checkpoints.new = function(type, position, radius, params = {}) {
    const checkpoint = new alt.Checkpoint(type, position, radius, 100, params.color ? new alt.RGBA(params.color) : alt.RGBA.white)
    if ('visible' in params) checkpoint.mp.visible = params.visible;
    if ('dimension' in params) checkpoint.dimension = mpDimensionToAlt(params.dimension);
    if ('direction' in params) checkpoint.nextPos = params.direction;
    return checkpoint.mp;
}

alt.on('entityEnterColshape', (shape, ent) => {
    if (!(ent instanceof alt.Player) || !(shape instanceof alt.Checkpoint)) return;
    mp.events.dispatch('playerEnterCheckpoint', ent.mp, shape.mp);
});

alt.on('entityLeaveColshape', (shape, ent) => {
    if (!(ent instanceof alt.Player) || !(shape instanceof alt.Checkpoint)) return;
    mp.events.dispatch('playerExitCheckpoint', ent.mp, shape.mp);
});
