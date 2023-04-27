import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { ClientPool } from '../ClientPool.js';
import { _BaseObject } from './BaseObject.js';
import natives from 'natives';
import {_VirtualEntityBase} from './VirtualEntityBase';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {EntityMixedView} from '../../shared/pools/EntityMixedView';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {hashIfNeeded, toAlt, toMp} from '../../shared/utils';

const store = new EntityStoreView();
const view = new EntityMixedView(store, EntityGetterView.fromClass(alt.Ped));

export class _Ped extends _VirtualEntityBase {
    /** @param {alt.Ped} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    destroy() {
        if (!this.alt.valid) return;
        this.alt.destroy();
    }

    get taskPlayAnim() {
        return this.playAnim;
    }

    get taskStartScenarioInPlace() {
        return this.startScenarioInPlace;
    }
}

export class _LocalPed extends _Ped {
    #handle = 0;
    #model = 0;

    /** @param {alt.VirtualEntity} alt */
    constructor(alt, heading) {
        super(alt);
        this.alt = alt;
        this.#model = alt.getMeta(mp.prefix + 'model');
        store.add(this, this.id, this.#handle, 65535);
    }

    destroy() {
        store.remove(this.id, this.#handle, 65535);
    }

    type = 'ped';

    get id() {
        return this.alt.id + 65536;
    }

    get model() {
        return this.#model;
    }

    set model(value) {
        const wasStreamedIn = this.alt.isStreamedIn;
        if (wasStreamedIn) this.streamOut();
        this.#model = value;
        if (wasStreamedIn) this.streamIn();
    }

    get remoteId() {
        return 65535;
    }

    get handle() {
        return this.#handle;
    }

    streamIn() {
        alt.loadModel(this.#model);
        this.#handle = natives.createPed(2, this.#model, this.alt.pos.x, this.alt.pos.y, this.alt.pos.z, this.alt.getMeta(mp.prefix + 'heading'), false, false);
        natives.setEntityCoordsNoOffset(this.#handle, this.alt.pos.x, this.alt.pos.y, this.alt.pos.z, false, false, false);
        natives.setEntityInvincible(this.#handle, true);
        natives.disablePedPainAudio(this.#handle, true);
        natives.freezeEntityPosition(this.#handle, true);
        natives.taskSetBlockingOfNonTemporaryEvents(this.#handle, true);
        store.add(this, undefined, this.#handle, undefined);
    }

    streamOut() {
        store.remove(undefined, this.#handle, undefined);
        this.alt.setMeta(mp.prefix + 'heading', natives.getEntityHeading(this.#handle));
        natives.deletePed(this.#handle);
        this.#handle = 0;
        natives.setModelAsNoLongerNeeded(this.#model);
    }

    getVariable(key) {
        if (this.alt.isRemote) return toMp(this.alt.getStreamSyncedMeta(key));
        return toMp(this.alt.getMeta(key));
    }

    setVariable(key, value) {
        if (this.alt.isRemote) return;
        this.alt.setMeta(key, toAlt(value));
    }

    hasVariable(key) {
        if (this.alt.isRemote) return this.alt.hasStreamSyncedMeta(key);
        return this.alt.hasMeta(key);
    }
}

mp.Ped = _Ped;

mp.peds = new ClientPool(view);

const group = new alt.VirtualEntityGroup(100);
mp.peds.new = function(model, position, heading, dimension = 0) {
    model = hashIfNeeded(model);
    const virtualEnt = new alt.VirtualEntity(group, position, 300);
    virtualEnt.setMeta(mp.prefix + 'type', VirtualEntityID.Ped);
    virtualEnt.setMeta(mp.prefix + 'model', model);
    virtualEnt.setMeta(mp.prefix + 'heading', heading);

    /** @type {_Ped} */
    const ent = virtualEnt.mp;
    ent.dimension = dimension;
    if (!virtualEnt.isStreamedIn) return ent;
    ent.setHeading(heading);

    return ent;
};
