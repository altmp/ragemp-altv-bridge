import * as alt from 'alt-shared';

/** @type {any} */
const mp = {
    prefix: globalThis.overrideBridgePrefix ?? '$bridge$', // prefix for bridge events and metas
    debug: false,
    _logWarnings: true,
    _forceReliable: false,
    _syncedMeta: false,
    _enableInterResourceEvents: true,
    _broadcastJoinLeave: true,
    notifyTrace(category, msg) {
    },
    _notifyError(...args) {
        for (const handler of alt.getEventListeners('resourceError')) {
            try {
                handler(...args);
            } catch(e) {
                console.error(e);
            }
        }
    }
};

// TODO: find a way to specify custom main resource name
mp._main = alt.Resource.current.config?.config?.['bridge-main'] ?? false;

export default mp;
