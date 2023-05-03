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
        scriptIDGetter: (scriptID) => alt.Object.all.find(e => e.scriptID === scriptID), // TODO: alt.Object.getByScriptID
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

    set model(value) {
        if (!this.alt?.valid) return;
        value = hashIfNeeded(value);
        const pos = this.alt.pos;
        const rot = this.alt.rot;
        const alpha = this.alt.alpha;
        this.alt.destroy();
        this.alt = new alt.Object(value, pos, rot, true, true, true, mp._objectStreamRange);
        this.alt.alpha = alpha;
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

    get isWeak() {
        return this.alt.isWorldObject;
    }

    get hidden() {
        return !natives.isEntityVisible(this.handle);
    }

    set hidden(value) {
        natives.setEntityVisible(this.handle, !value, false);
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

    //#region Natives
    get hasClearLosToInFront() {
        return this.hasClearLosToEntityInFront; // hasEntityClearLosToEntityInFront
    }

    get isAMission() {
        return this.isAMissionEntity; // isEntityAMissionEntity
    }

    get isTouching() {
        return this.isTouchingEntity; // isEntityTouchingEntity
    }

    get attachTo() {
        return this.attachToEntity; // attachEntityToEntity
    }

    get isAt() {
        return this.isAtCoord; // isEntityAtCoord
    }

    get setNoCollision() {
        return this.setNoCollisionEntity; // setEntityNoCollisionEntity
    }

    get clearLastDamage() {
        return this.clearLastDamageEntity; // clearEntityLastDamageEntity
    }

    get setAsMission() {
        return this.setAsMissionEntity; // setEntityAsMissionEntity
    }

    get attachToPhysically() {
        return this.attachToEntityPhysically; // attachEntityToEntityPhysically
    }

    get hasBeenDamagedBy() {
        return this.hasBeenDamagedByEntity; // hasEntityBeenDamagedByEntity
    }

    get isAttachedTo() {
        return this.isAttachedToEntity; // isEntityAttachedToEntity
    }

    get hasClearLosTo() {
        return this.hasClearLosToEntity; // hasEntityClearLosToEntity
    }

    rotate(p1, p2, p3) {
        return natives.rotateObject(this.handle, p1, p2, p3);
    }

    getAlpha() {
        return natives.getEntityAlpha(this.handle);
    }

    setAlpha(alpha, skin) {
        return natives.setEntityAlpha(this.handle, alpha, skin);
    }

    getPedIndexFromIndex() {
        return natives.getPedIndexFromEntityIndex(this.handle);
    }

    getVehicleIndexFromIndex() {
        return natives.getVehicleIndexFromEntityIndex(this.handle);
    }

    get setCoords2() {
        return this.setCoordsWithoutPlantsReset;
    }

    getModel() {
        return natives.getEntityModel(this.handle);
    }

    get isCollisonDisabled() {
        return this.getCollisionDisabled;
    }
    //#endregion Natives
}

export class _NetworkObject extends _Object {
    #handle;

    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get handle() {
        return this.#handle;
    }

    streamIn() {
        alt.loadModel(this.model);
        this.#handle = natives.createObject(this.model, this.alt.pos.x, this.alt.pos.y, this.alt.pos.z, false, false, false);
        natives.setEntityHeading(this.#handle, this.alt.getStreamSyncedMeta(mp.prefix + 'heading') ?? 0);
        natives.activatePhysics(this.#handle);
        // natives.freezeEntityPosition(this.#handle, true);
        // natives.setEntityCollision(this.#handle, false, true); // TODO: check if needed
        natives.setVehicleColourCombination(this.#handle, 0);
    }

    streamOut() {
        natives.deleteObject(this.#handle);
        this.#handle = 0;
        natives.setModelAsNoLongerNeeded(this.model);
    }

    posChange() {}
    onDestroy() {
        store.remove(this.id, this.handle, this.id);
    }
    onCreate() {
        store.add(this, this.id, undefined, this.id);
    }
    update() {}

    destroy() {}

    get rotation() {
        return this.alt.getStreamSyncedMeta(mp.prefix + 'rotation');
    }

    set rotation(value) {}

    get model() {
        return this.alt.getStreamSyncedMeta(mp.prefix + 'model');
    }

    set model(value) {}

    get alpha() {
        return this.alt.getStreamSyncedMeta(mp.prefix + 'alpha');
    }

    set alpha(value) {}

    get isWeak() {
        return false;
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
    model = hashIfNeeded(model);
    if (!natives.isModelValid(model)) model = alt.hash('prop_ecola_can');
    const obj = new alt.Object(model, position, new alt.Vector3(params.rotation ?? alt.Vector3.zero).toRadians(), true, false, true, mp._objectStreamRange);
    obj.setMeta(mp.prefix + 'bridge', true);
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
    if ('rotation' in params) obj.rotation = params.rotation;
    if ('alpha' in params) obj.alt.alpha = params.alpha;

    return obj;
};

alt.on('gameEntityCreate', (ent) => {
    if (ent instanceof alt.Object && ent.getMeta(mp.prefix + 'bridge')) {
        // natives.freezeEntityPosition(ent.scriptID, true);
        // natives.setEntityCollision(ent.scriptID, false, true);
    }
});
