import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_Entity} from './Entity';
import {ServerPool} from '../pools/ServerPool';
import {_Label} from './Label';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {hashIfNeeded, internalName} from '../../shared/utils';
import {StreamSyncedMetaProxy} from '../../shared/meta';


const view = new EntityStoreView();

export class _Object extends _Entity {

    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        view.add(this, this.id);
        this.data = new StreamSyncedMetaProxy(alt);
    }

    type = 'object';

    destroy() {
        if (!this.valid) return;
        view.remove(this.id);
        super.destroy();
    }

    get id() {
        return this.alt.id + 65536;
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

    #model;
    get model() {
        return this.#model;
    }
    set model(value) {
        this.#model = value;
        this.alt.setStreamSyncedMeta(internalName('model'), value);
    }

    #alpha = 255;
    get alpha() {
        return this.#alpha;
    }
    set alpha(value) {
        this.#alpha = value;
        this.alt.setStreamSyncedMeta(internalName('alpha'), value);
    }

    #rotation = mp.Vector3.zero;
    get rotation() {
        return this.#rotation;
    }
    set rotation(value) {
        this.#rotation = value;
        this.alt.setStreamSyncedMeta(internalName('rotation'), new alt.Vector3(value));
    }

    get notifyStreaming() {
        return false;
    }

    set notifyStreaming(value) {
        // unused
    }
}

alt.on('baseObjectRemove', (ent) => {
    if (!ent?.mp) return;
    if (ent.mp instanceof _Object) view.remove(ent.mp.id);
});

mp.Object = _Object;

// Object.defineProperty(alt.NetworkObject.prototype, 'mp', {
//     get() {
//         return this._mp ??= new _Object(this);
//     }
// });

mp.objects = new ServerPool(view, [_Object]);

const group = new alt.VirtualEntityGroup(255);
mp.objects.new = (model, position, params = {}) => {
    if (model == null) {
        const msg = 'Tried to create object with invalid model';
        console.warn(msg, model);
        const err = new Error(msg + ' ' + model);
        mp._notifyError(err, 'unknown', 0, err.stack, 'warning');
    }

    model = hashIfNeeded(model);
    const virtualEnt = new alt.VirtualEntity(group, position, params.drawDistance ?? mp.streamingDistance);
    virtualEnt.setStreamSyncedMeta(internalName('type'), VirtualEntityID.Object);
    const ent = virtualEnt.mp;
    ent.model = model;
    ent.position = position;
    if ('rotation' in params) ent.rotation = params.rotation;
    if ('alpha' in params) ent.alpha = params.alpha;
    if ('dimension' in params) ent.dimension = params.dimension;

    return ent;
};
