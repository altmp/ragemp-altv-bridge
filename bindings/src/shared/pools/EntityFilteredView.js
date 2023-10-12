import {EntityGetterView} from './EntityGetterView';
import {EntityBaseView} from './EntityBaseView';
import {EntityStoreView} from './EntityStoreView';

export class EntityFilteredView extends EntityBaseView {
    /**
     * @param {EntityBaseView} view
     * @param {Function} filter
     */
    constructor(view, filter) {
        super();
        this.view = view;
        this.filter = filter;
    }

    toArray() {
        return this.view.toArray().filter(this.filter);
    }

    toArrayInStreamRange() {
        return this.view.toArrayInStreamRange().filter(this.filter);
    }

    getByID(id) {
        const ent = this.view.getByID(id);
        if (!ent || !this.filter(ent)) return null;
        return ent;
    }

    getByRemoteID(id) {
        const ent = this.view.getByRemoteID(id);
        if (!ent || !this.filter(ent)) return null;
        return ent;
    }

    getByScriptID(id) {
        const ent = this.view.getByScriptID(id);
        if (!ent || !this.filter(ent)) return null;
        return ent;
    }

    has(id) {
        const has = this.view.has(id);
        if (!has) return false;
        const ent = this.view.getByID(id);
        return this.filter(ent);

    }

    hasRemoteID(id) {
        const has = this.view.hasRemoteID(id);
        if (!has) return false;
        const ent = this.view.getByRemoteID(id);
        return this.filter(ent);
    }

    hasScriptID(id) {
        const has = this.view.hasScriptID(id);
        if (!has) return false;
        const ent = this.view.getByScriptID(id);
        return this.filter(ent);
    }

    getCount() {
        return this.view.toArray().filter(this.filter).length;
    }
}
