import mp from '../../shared/mp';
import * as alt from 'alt-client';
import * as natives from 'natives';
import {_Entity} from './Entity';
import {Pool} from '../Pool';

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
}

mp.Object = _Object;


Object.defineProperty(alt.Object.prototype, 'mp', {
    get() {
        return this._mp ??= new _Object(this);
    }
});

Object.defineProperty(alt.NetworkObject.prototype, 'mp', {
    get() {
        return this._mp ??= new _Object(this);
    }
});

// TODO: streamedIn
mp.objects = new Pool(() => alt.Object.all, () => [], () => null, () => alt.Object.all.length);

mp.objects.atRemoteId = function(id) {
    return alt.Object.getByRemoteID(id)?.mp ?? null;
}

mp.objects.atHandle = function(handle) {
    return alt.Object.getByScriptID(handle)?.mp ?? null;
}

mp.objects.new = (model, position, params) => {
    console.log('Spawning model ' + model);
    if (!natives.isModelValid(model)) model = alt.hash('prop_ecola_can');
    const obj = new alt.Object(model, position, params.rotation ?? alt.Vector3.zero, true, true);
    natives.freezeEntityPosition(obj, true);
    if ('alpha' in params) obj.alpha = params.alpha;
    // TODO: dimension

    return obj.mp;
}

mp.objects.newWeak = (handle) => {
    const obj = alt.Object.allWorld.find(e => e.scriptID === handle);

    if (!obj) return null;
    return obj.mp;
}

mp.objects.newWeaponObject = (model, position, params) => {
    const handle = natives.createWeaponObject(model, params.ammo ?? 0, position.x, position.y, position.z, params.showWorldObject ?? false, params.scale ?? 1, 0, 0, 0);
    const obj = mp.objects.newWeak(handle);
    natives.freezeEntityPosition(obj.handle, true);
    if ('rotation' in params) obj.alt.rot = params.rotation;
    if ('alpha' in params) obj.alt.alpha = params.alpha;
    // TODO: dimension

    return obj;
}
