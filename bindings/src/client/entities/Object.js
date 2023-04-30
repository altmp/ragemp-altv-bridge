import mp from '../../shared/mp';
import * as alt from 'alt-client';
import * as natives from 'natives';
import {_Entity} from './Entity';
import { ClientPool } from '../ClientPool';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {EntityMixedView} from '../../shared/pools/EntityMixedView';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {hashIfNeeded} from '../../shared/utils';
import { mpDimensionToAlt } from '../../shared/utils';

const store = new EntityStoreView();
const view = new EntityMixedView(store, new EntityGetterView(
    () => alt.Object.all,
    (id) => alt.Object.all.find(e => e.mp.id === id),
    {
        remoteIDGetter: alt.Object.getByID,
        scriptIDGetter: alt.Object.getByScriptID,
        streamRangeGetter: alt.Object.all.filter(e => e.scriptID !== 0)
    }
));

export class _Object extends _Entity {
    /** @param {alt.Object} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    type = 'object';

    destroy() {
        if (!this.alt.valid) return;
        this.alt.destroy();
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }

    get rotation() {
        return new mp.Vector3(this.alt.rot.toDegrees());
    }

    set rotation(value) {
        this.alt.rot = new alt.Vector3(value).toRadians();
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

    get streamingRange() {
        return this.alt.streamingDistance;
    }

    set streamingRange(value) {
        this.alt.streamingDistance = value;
    }

    get isWeak() {
        return this.alt.isWorldObject;
    }

    get hidden() {
        return !natives.isEntityVisible(this.alt);
    }

    set hidden(value) {
        natives.setEntityVisible(this.alt, !value, false);
    }

    get setNoCollision() {
        return this.setNoCollisionEntity;
    }

    get attachTo() {
        return this.attachToEntity;
    }

    get isAttachedTo() {
        return this.isAttachedToEntity;
    }
}

mp.Object = _Object;


Object.defineProperty(alt.Object.prototype, 'mp', {
    get() {
        return this._mp ??= new _Object(this);
    }
});

mp.objects = new ClientPool(view);

mp.objects.new = (model, position, params) => {
    if (!natives.isModelValid(model)) model = alt.hash('prop_ecola_can');
    const obj = new alt.Object(model, position, new alt.Vector3(params.rotation ?? alt.Vector3.zero).toRadians(), true, true, true, mp._objectStreamRange);
    natives.freezeEntityPosition(obj, true);
    if ('alpha' in params) obj.alpha = params.alpha;
    if ('dimension' in params) obj.dimension = mpDimensionToAlt(params.dimension);

    return obj.mp;
};

mp.objects.newWeak = (handle) => {
    const obj = alt.Object.allWorld.find(e => e.scriptID === handle);

    if (!obj) return null;
    return obj.mp;
};

mp.objects.newWeaponObject = (model, position, params) => {
    model = hashIfNeeded(model);
    const handle = natives.createWeaponObject(model, params.ammo ?? 0, position.x, position.y, position.z, params.showWorldObject ?? false, params.scale ?? 1, 0, 0, 0);
    const obj = mp.objects.newWeak(handle);
    natives.freezeEntityPosition(obj.handle, true);
    if ('rotation' in params) obj.alt.rot = params.rotation;
    if ('alpha' in params) obj.alt.alpha = params.alpha;
    // TODO: dimension

    return obj;
};
