import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {ClientPool} from '../ClientPool.js';
import {_BaseObject} from './BaseObject.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {mpDimensionToAlt} from '../../shared/utils';

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

    destroy() {
        if (!this.alt.valid) return;

        if (this.alt.isPointIn(alt.Player.local.pos))
            mp.events.dispatchLocal('playerExitCheckpoint', this);

        this.alt.destroy();
    }
}

Object.defineProperty(alt.Checkpoint.prototype, 'mp', {
    get() {
        return this._mp ??= new _Checkpoint(this);
    }
});

mp.Checkpoint = _Checkpoint;

mp.checkpoints = new ClientPool(EntityGetterView.fromClass(alt.Checkpoint));

mp.checkpoints.new = function (type, pos, radius, options = {}) {
    const color = options.color ? new alt.RGBA(...options.color) : alt.RGBA.red;
    const checkpoint = new alt.Checkpoint(type, pos, options.nextPos ?? new alt.Vector3(0, 0, 0), radius, 100, color, color, mp.streamingDistance);
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
