import {EntityGetterView} from './EntityGetterView';
import {EntityBaseView} from './EntityBaseView';
import {EntityStoreView} from './EntityStoreView';

export class EntityMixedView extends EntityBaseView {
    /**
     * @param {EntityBaseView} store
     * @param {EntityBaseView} getter
     */
    constructor(store, getter) {
        super();
        this.store = store;
        this.getter = getter;
    }

    toArray() {
        return [...this.store.toArray(), ...this.getter.toArray()];
    }

    toArrayInStreamRange() {
        return [...this.store.toArrayInStreamRange(), ...this.getter.toArrayInStreamRange()];
    }

    getByID(id) {
        return this.store.getByID(id) ?? this.getter.getByID(id);
    }

    getByRemoteID(id) {
        return this.store.getByRemoteID(id) ?? this.getter.getByRemoteID(id);
    }

    getByScriptID(id) {
        return this.store.getByScriptID(id) ?? this.getter.getByScriptID(id);
    }

    has(id) {
        return this.store.has(id) || this.getter.has(id);
    }

    hasRemoteID(id) {
        return this.store.hasRemoteID(id) || this.getter.hasRemoteID(id);
    }

    hasScriptID(id) {
        return this.store.hasScriptID(id) || this.getter.hasScriptID(id);
    }

    getCount() {
        return this.store.getCount() + this.getter.getCount();
    }
}
