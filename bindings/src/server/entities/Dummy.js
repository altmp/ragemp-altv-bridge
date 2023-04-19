import mp from '../../shared/mp';
import {ServerPool} from '../pools/ServerPool';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import { toMp, toAlt } from '../../shared/utils';

const view = new EntityStoreView();

class _MpEntity {
    #meta;
    constructor() {
        this.#meta = {};
    }

    setVariable(key, value) {
        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key)) this.setVariable(innerKey, innerValue);
            return;
        }

        this.#meta[key] = toAlt(value);
    }

    setVariables(obj) {
        this.setVariable(obj);
    }

    getVariable(key) {
        return toMp(this.#meta[key]);
    }

    hasVariable(key) {
        return typeof this.#meta[key] !== 'undefined';
    }

    destroy() {
        //yes pls
    }
}

export class _Dummy extends _MpEntity {
    get mp() {
        return this;
    }

    get type() {
        return 'dummy';
    }
}

mp.Dummy = _Dummy;
mp.dummies = new ServerPool(view);

mp.dummies.forEachByType = (dummyEntityType, fn) => {
    mp.dummies.forEach(entity => {
        if(entity.getVariable(mp.prefix + 'dummyType') == dummyEntityType) {
            fn(entity);
        }
    });
};

mp.dummies.new = function(dummyEntityType, sharedVariables = {}) {
    const ent = new _Dummy();

    ent.setVariable(mp.prefix + 'dummyType', dummyEntityType);
    ent.setVariables(sharedVariables);

    return ent;
};