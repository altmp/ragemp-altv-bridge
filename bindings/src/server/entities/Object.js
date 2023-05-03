import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_Entity} from './Entity';
import {ServerPool} from '../pools/ServerPool';
import {_Label} from './Label';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {hashIfNeeded} from '../../shared/utils';


const view = new EntityStoreView();

export class _Object extends _Entity {

    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        view.add(this, this.id);
    }

    type = 'object';

    destroy() {
        if (!this.alt.valid) return;
        view.remove(this.id);
        this.alt.destroy();
    }

    get setVariable() {
        return this.setStreamVariable;
    }

    get getVariable() {
        return this.getStreamVariable;
    }

    get hasVariable() {
        return this.hasStreamVariable;
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }

    #model;
    get model() {
        return this.#model;
    }
    set model(value) {
        this.#model = value;
        this.alt.setStreamSyncedMeta(mp.prefix + 'model', value);
    }

    #alpha;
    get alpha() {
        return this.#alpha;
    }
    set alpha(value) {
        this.#alpha = value;
        this.alt.setStreamSyncedMeta(mp.prefix + 'alpha', value);
    }

    #rotation;
    get rotation() {
        return this.#rotation;
    }
    set rotation(value) {
        this.#rotation = value;
        this.alt.setStreamSyncedMeta(mp.prefix + 'rotation', value);
    }

    get notifyStreaming() {
        return false;
    }

    set notifyStreaming(value) {
        // unused
    }
}

alt.on('baseObjectRemove', (ent) => {
    if (ent.mp instanceof _Object) view.remove(ent.mp.id);
});

mp.Object = _Object;

// Object.defineProperty(alt.NetworkObject.prototype, 'mp', {
//     get() {
//         return this._mp ??= new _Object(this);
//     }
// });

mp.objects = new ServerPool(view);

const group = new alt.VirtualEntityGroup(255);
mp.objects.new = (model, position, params = {}) => {
    model = hashIfNeeded(model);
    const virtualEnt = new alt.VirtualEntity(group, position, params.drawDistance ?? 300);
    virtualEnt.setStreamSyncedMeta(mp.prefix + 'type', VirtualEntityID.Object);
    const ent = virtualEnt.mp;
    ent.model = model;
    ent.position = position;
    if ('rotation' in params) ent.rotation = new alt.Vector3(params.rotation).toRadians();
    if ('alpha' in params) ent.alpha = params.alpha;
    if ('dimension' in params) ent.dimension = params.dimension;

    return ent;
};
