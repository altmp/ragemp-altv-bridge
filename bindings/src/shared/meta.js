import {toAlt, toMp} from './utils';

class ExtendableProxy {
    constructor(...args) {
        return new Proxy(...args);
    }
}

export class SyncedMetaProxy extends ExtendableProxy {
    constructor(target, readOnly = false) {
        const obj = {};
        super(obj, {
            get: (_, prop) => {
                if (Object.hasOwn(obj, prop)) return obj[prop];
                if (prop === Symbol.toStringTag) return '[object Meta]';
                return toMp(target.getSyncedMeta(prop))
            },
            set: readOnly
                ? (() => {})
                : ((_, prop, value) => {
                    target.setSyncedMeta(prop, toAlt(value))
                })
        })
    }
}
