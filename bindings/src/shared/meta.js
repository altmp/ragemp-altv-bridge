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
                if (typeof prop != 'string') return obj[prop];
                if (!target.hasSyncedMeta) return obj[prop];
                if (target.hasSyncedMeta(prop)) return toMp(target.getSyncedMeta(prop));
                return obj[prop];
            },
            set: readOnly
                ? (() => {})
                : ((_, prop, value) => {
                    if (typeof prop != 'string') return;
                    if (!target.setSyncedMeta) return;
                    target.setSyncedMeta(prop, toAlt(value))
                })
        })
    }
}
