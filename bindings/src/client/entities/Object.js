import mp from '../../shared/mp';
import * as alt from 'alt-client';
import * as natives from 'natives';
import {_Entity} from './Entity';
import { ClientPool } from '../ClientPool';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {EntityMixedView} from '../../shared/pools/EntityMixedView';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {hashIfNeeded, internalName, toAlt, toMp} from '../../shared/utils';
import { mpDimensionToAlt } from '../../shared/utils';
import {BaseObjectType} from '../../shared/BaseObjectType';

const store = new EntityStoreView(1, (entity) => {
    // works for _NetworkObject
    // but what if entity is alt.LocalObject?
    return entity.handle !== 0;
});
const view = new EntityMixedView(store, new EntityGetterView(
    () => alt.LocalObject.all,
    (id) => alt.LocalObject.all.find(e => e && e.mp.id === id),
    {
        remoteIDGetter: alt.LocalObject.getByID,
        scriptIDGetter: alt.LocalObject.getByScriptID,
        streamRangeGetter: () => alt.LocalObject.streamedIn
    },
    [BaseObjectType.LocalObject]
));

export class _Object extends _Entity {
    /** @param {alt.LocalObject} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    type = 'object';

    getVariable(key) {
        if (!this.hasVariable(key)) return undefined;
        return toMp(this.alt.getMeta(key));
    }

    hasVariable(key) {
        return this.alt.hasMeta(key);
    }

    setVariable(key, value) {
        this.alt.setMeta(key, toAlt(value));
    }

    get position() {
        if (!this.alt.valid) return mp.Vector3.zero;
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }

    get rotation() {
        if (!this.alt.valid) return mp.Vector3.zero;
        if (!this.handle) return new mp.Vector3(this.alt.rot.toDegrees());
        return new mp.Vector3(natives.getEntityRotation(this.handle, 0));
    }

    set rotation(value) {
        if (!this.alt.valid) return;
        if (!this.handle) this.alt.rot = new alt.Vector3(value).toRadians();
        else natives.setEntityRotation(this.handle, value.x, value.y, value.z, 0, false);
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
        this.alt = new alt.LocalObject(value, pos, rot, true, true, true, mp.streamingDistance);
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

    setAlpha(alpha, skin = false) {
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

    getVariable(key) {
        if (!this.hasVariable(key)) return undefined;
        return toMp(this.alt.getStreamSyncedMeta(key));
    }

    hasVariable(key) {
        return this.alt.hasStreamSyncedMeta(key);
    }

    get handle() {
        return this.#handle;
    }

    get id() {
        return this.alt.remoteID + 65536;
    }

    get remoteId() {
        return this.alt.remoteID + 65536;
    }

    #streamingCounter = 0;
    async streamIn() {
        try {
            const counter = ++this.#streamingCounter;
            const shouldCancel = () => counter !== this.#streamingCounter;

            let model = this.model;
            if (!model || !natives.isModelValid(model)) {
                await alt.Utils.waitFor(() => this.model && natives.isModelValid(this.model));
                model = this.model;
            }
            if (shouldCancel()) return;

            await alt.Utils.requestModel(model);
            if (shouldCancel()) return;

            this.#handle = natives.createObject(model, this.alt.pos.x, this.alt.pos.y, this.alt.pos.z, false, false, false);
            natives.setEntityCoordsNoOffset(this.#handle, this.alt.pos.x, this.alt.pos.y, this.alt.pos.z, false, false, false);
            store.add(this, undefined, this.#handle, undefined);

            const rot = this.alt.getStreamSyncedMeta(internalName('rotation')) ?? alt.Vector3.zero;
            natives.setEntityRotation(this.#handle, rot.x, rot.y, rot.z, 2, false);
            natives.activatePhysics(this.#handle);

            const alpha = this.alt.getStreamSyncedMeta(internalName('alpha')) ?? 255;
            if (alpha < 255) {
                natives.setEntityAlpha(this.#handle, alpha, false);
            }

            natives.freezeEntityPosition(this.#handle, true);
            natives.setVehicleColourCombination(this.#handle, 0);
        } catch (e) {
            console.warn('Failed to stream in NetworkObject:', e);
            mp._notifyError(e, 'unknown', 0, e.stack, 'warning');
        }

        if (this.alt.valid) mp.events.dispatchLocal('entityStreamIn', this);
    }

    streamOut() {
        this.#streamingCounter++;

        if (!this.#handle) return;
        natives.deleteObject(this.#handle);
        store.remove(undefined, this.#handle, undefined);
        this.#handle = 0;
        const model = this.model;
        if (model) natives.setModelAsNoLongerNeeded(model);
    }

    posChange() {
        const pos = this.alt.pos;
        natives.setEntityCoords(this.#handle, pos.x, pos.y, pos.z, false, false, false, false);
    }
    onDestroy() {
        store.remove(this.id, this.handle, this.remoteId);
    }
    onCreate() {
        store.add(this, this.id, undefined, this.remoteId);
    }
    update(key, value) {
        if (key === (internalName('rotation'))) {
            const rot = value ?? alt.Vector3.zero;
            natives.setEntityRotation(this.#handle, value.x, value.y, value.z, 2, false);
        }
        if (key === (internalName('alpha'))) {
            if (value >= 255) {
                natives.resetEntityAlpha(this.#handle);
            } else {
                natives.setEntityAlpha(this.#handle, value, false);
            }
        }
        if (key === (internalName('model'))) {
            this.streamOut();
            this.streamIn();
        }
    }

    destroy() {}


    get position() {
        if (!this.alt.valid) return mp.Vector3.zero;
        if (!this.handle) return new mp.Vector3(this.alt.pos);
        return new mp.Vector3(natives.getEntityCoords(this.handle, false));
    }

    set position(value) {
        if (!this.alt.valid || !this.handle) return;
        natives.setEntityCoords(this.handle, value.x, value.y, value.z, false, false, false, false);
    }

    get model() {
        return this.alt.getStreamSyncedMeta(internalName('model'));
    }

    set model(value) {}

    get alpha() {
        return this.alt.getStreamSyncedMeta(internalName('alpha'));
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

Object.defineProperty(alt.LocalObject.prototype, 'mp', {
    get() {
        return this._mp ??= new _Object(this);
    }
});

mp.objects = new ClientPool(view, [_Object, _NetworkObject]);

mp.objects.new = (model, position, params = {}) => {
    mp.notifyTrace('entity', 'creating local object', model, position);
    model = hashIfNeeded(model);
    if (!natives.isModelValid(model)) model = alt.hash('prop_ecola_can');
    const obj = new alt.LocalObject(model, position, new alt.Vector3(params.rotation ?? alt.Vector3.zero).toRadians(), true, false, true, params?.streamingDistance ?? mp.streamingDistance);
    obj._mpOwned = true;
    if ('alpha' in params) obj.alpha = params.alpha;
    if ('dimension' in params) obj.dimension = mpDimensionToAlt(params.dimension);

    if (obj.isStreamedIn) {
        natives.freezeEntityPosition(obj, true);
    }
    return obj.mp;
};

mp.objects.newWeak = (handle) => {
    const obj = alt.LocalObject.allWorld.find(e => e.scriptID === handle);

    if (!obj) return null;
    const ent = obj.mp;

    ent.destroy = () => {
        if (!ent.alt.valid) return;
        const scriptID = ent.handle;
        natives.deleteObject(scriptID);
        ent.valid = false;
    };

    return ent;
};

mp.objects.newWeaponObject = (model, position, params = {}) => {
    model = hashIfNeeded(model);
    const obj = new alt.WeaponObject(model, position, params.rotation ?? alt.Vector3.zero, undefined, params.ammo ?? 0, params.showWorldObject ?? false, params.scale ?? 1, true, mp.streamingDistance);
    obj._mpOwned = true;

    if (obj.isSpawned) {
        natives.freezeEntityPosition(obj.scriptID, true);
    }

    const ent = obj.mp;
    if ('alpha' in params) ent.alpha = params.alpha;
    if ('dimension' in params) obj.dimension = mpDimensionToAlt(params.dimension);
    return ent;
};

alt.on('gameEntityCreate',  (ent) => {
    if ((ent instanceof alt.LocalObject || ent instanceof alt.WeaponObject) && ent._mpOwned) {
        natives.freezeEntityPosition(ent.scriptID, true);
    }
});
