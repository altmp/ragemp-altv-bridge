import mp from '../../shared/mp';
import * as alt from 'alt-client';
import * as natives from 'natives';
import {_Entity} from './Entity';
import { ClientPool } from '../pools/ClientPool';
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

const view = EntityGetterView.fromClass(alt.Object, [BaseObjectType.Object, BaseObjectType.LocalObject]);

export class _LocalObject extends _Entity {
    /** @param {alt.LocalObject} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    type = 'object';

    getVariable(key) {
        if (!this.hasVariable(key)) return;
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

export class _Obect extends _LocalObject {
    /** @param {alt.Object} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    set model(value) {}

    set alpha(value) {}

    get isWeak() {
        return false;
    }
}

mp.Object = _LocalObject;


Object.defineProperty(alt.Object.prototype, 'mp', {
    get() {
        return this._mp ??= new _Obect(this);
    }
});

Object.defineProperty(alt.LocalObject.prototype, 'mp', {
    get() {
        return this._mp ??= new _LocalObject(this);
    }
});

mp.objects = new ClientPool(view, [_Obect, _LocalObject]);

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
