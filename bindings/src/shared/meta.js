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
                ? (() => true)
                : ((_, prop, value) => {
                    if (typeof prop != 'string') return true;
                    if (!target.setSyncedMeta) return true;
                    target.setSyncedMeta(prop, toAlt(value));
                    return true;
                })
        });
    }
}


export class StreamSyncedMetaProxy extends ExtendableProxy {
    constructor(target, readOnly = false) {
        const obj = {};
        super(obj, {
            get: (_, prop) => {
                if (typeof prop != 'string') return obj[prop];
                if (!target.hasStreamSyncedMeta) return obj[prop];
                if (target.hasStreamSyncedMeta(prop)) return toMp(target.getStreamSyncedMeta(prop));
                return obj[prop];
            },
            set: readOnly
                ? (() => true)
                : ((_, prop, value) => {
                    if (typeof prop != 'string') return true;
                    if (!target.setStreamSyncedMeta) return true;
                    target.setStreamSyncedMeta(prop, toAlt(value));
                    return true;
                })
        });
    }
}
