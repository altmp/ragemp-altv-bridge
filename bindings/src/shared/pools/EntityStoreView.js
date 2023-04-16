import {EntityBaseView} from './EntityBaseView';

export class EntityStoreView extends EntityBaseView {
    constructor(startId = 1, isInStreamRange = _ => true) {
        super();
        this.lastId = startId;
        this.isInStreamRange = isInStreamRange;
    }

    entities = {};
    remoteIDEntities = {};
    scriptIDEntities = {};
    entitiesArr = [];

    getId() {
        return this.lastId++;
    }

    add(ent, id, scriptID, remoteID) {
        if (id != null) this.entities[id] = ent;
        if (scriptID != null) this.scriptIDEntities[scriptID] = ent;
        if (remoteID != null) this.remoteIDEntities[remoteID] = ent;
        if (id != null) this.entitiesArr = Object.values(this.entities);
    }

    remove(id, scriptID, remoteID) {
        if (id != null) delete this.entities[id];
        if (scriptID != null) delete this.scriptIDEntities[scriptID];
        if (remoteID != null) delete this.remoteIDEntities[remoteID];
        if (id != null) this.entitiesArr = Object.values(this.entities);
    }

    toArray() {
        return this.entitiesArr;
    }

    toArrayInStreamRange() {
        return this.toArray().map(this.isInStreamRange);
    }

    getByID(id) {
        return this.entities[id] ?? null;
    }

    getByRemoteID(id) {
        return this.remoteIDEntities[id] ?? null;
    }

    getByScriptID(id) {
        return this.scriptIDEntities[id] ?? null;
    }

    has(id) {
        return id in this.entities;
    }

    hasRemoteID(id) {
        return id in this.remoteIDEntities;
    }

    hasScriptID(id) {
        return id in this.scriptIDEntities;
    }

    getCount() {
        return this.entitiesArr.length;
    }
}
