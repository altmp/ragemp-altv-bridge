import {toAlt, toMp} from './utils';
import mp from './mp';

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
                if (!target[mp._hasSyncedMetaKey]) return obj[prop];
                if (target[mp._hasSyncedMetaKey](prop)) return toMp(target[mp._getSyncedMetaKey](prop));
                return obj[prop];
            },
            set: readOnly
                ? (() => true)
                : ((_, prop, value) => {
                    if (typeof prop != 'string') return true;
                    if (!target[mp._setSyncedMetaKey]) return true;
                    target[mp._setSyncedMetaKey](prop, toAlt(value));
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
