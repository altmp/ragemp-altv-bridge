import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_Entity} from './Entity';
import {ServerPool} from '../pools/ServerPool';
import {_Label} from './Label';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {hashIfNeeded, internalName} from '../../shared/utils';
import {StreamSyncedMetaProxy} from '../../shared/meta';
import { ObjectPool } from 'server/pools/ObjectPool';
import { BaseObjectType } from 'shared/BaseObjectType';
import { EntityGetterView } from 'shared/pools/EntityGetterView';


const view = new EntityStoreView();

export class _Object extends _Entity {

    /** @param {alt.Object} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    type = 'object';


    get model() {
        return this.alt.model;
    }
    set model(value) {
        if (this.alt.model === value) return;
        this.alt.model = value;
    }

    get alpha() {
        return this.alpha;
    }
    set alpha(value) {
        if (this.alpha === value) return;
        this.alpha = value;
    }

    get notifyStreaming() {
        return false;
    }

    set notifyStreaming(value) {
        // unused
    }
}

// alt.on('baseObjectRemove', (ent) => {
//     if (!ent?.mp) return;
//     if (ent.mp instanceof _Object) view.remove(ent.mp.id);
// });

mp.Object = _Object;

Object.defineProperty(alt.Object.prototype, 'mp', {
    get() {
        return this._mp ??= new _Object(this);
    }
});

mp.objects = new ObjectPool(EntityGetterView.fromClass(alt.Object, [BaseObjectType.Object]), [_Object], 8);

mp.objects.new = (model, position, params = {}) => {
    if (model == null) {
        const msg = 'Tried to create object with invalid model';
        console.warn(msg, model);
        const err = new Error(msg + ' ' + model);
        mp._notifyError(err, 'unknown', 0, err.stack, 'warning');
    }

    model = hashIfNeeded(model);
    const objectEnt = new alt.Object(
        model,
        position,
        'rotation' in params ? params.rotation : alt.Vector3.zero,
        'alpha' in params ? params.alpha : 255,
        'texture' in params ? params.texture : 0,
        void null,
        params.drawDistance ?? mp.streamingDistance,
        false, // isStaticEntity
    );
    objectEnt.dimension = params.dimension ?? 0;
    objectEnt.frozen = params.frozen ?? true; // We freeze objects by default to simulate RAGEMP behavior

    const ent = objectEnt.mp;

    return ent;
};
