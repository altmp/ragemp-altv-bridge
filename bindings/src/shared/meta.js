class ExtendableProxy {
    constructor(...args) {
        return new Proxy(...args);
    }
}

export class SyncedMetaProxy extends ExtendableProxy {
    constructor(target, readOnly = false) {
        super({}, {
            get: (_, prop) => target.alt.getSyncedMeta(prop),
            set: readOnly
                ? (() => {}) 
                : ((_, prop, value) => target.alt.setSyncedMeta(prop, value))
        })
    }
}