export class SyncedMetaProxy extends Proxy {
    constructor(target, readOnly = false) {
        super({}, {
            get: (_, prop) => target.alt.getSyncedMeta(prop),
            set: readOnly
                ? (() => {}) 
                : ((_, prop, value) => target.alt.setSyncedMeta(prop, value))
        })
    }
}