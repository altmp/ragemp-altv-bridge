import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_Entity} from './Entity';
import {Pool} from '../pools/Pool';

export class _Object extends _Entity {

    /** @param {alt.Object} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    destroy() {
        this.alt.destroy();
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }

    get model() {
        return this.alt.model;
    }

    get alpha() {
        return this.alt.alpha;
    }

    set alpha(value) {
        this.alt.alpha = value;
    }

    get notifyStreaming() {
        return false;
    }

    set notifyStreaming(value) {
        // unused
    }

    // TODO: streaming range
}

mp.Object = _Object;

Object.defineProperty(alt.NetworkObject.prototype, 'mp', {
    get() {
        return this._mp ??= new _Object(this);
    }
});

mp.objects = new Pool(() => alt.NetworkObject.all, alt.NetworkObject.getByID, () => alt.NetworkObject.all.length);

mp.objects.new = (model, position, params) => {
    const obj = new alt.NetworkObject(model, position, params.rotation ?? alt.Vector3.zero, params.alpha ?? 0, 100);
    return obj.mp;
};
