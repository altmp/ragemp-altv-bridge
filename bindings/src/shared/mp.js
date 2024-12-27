import * as alt from 'alt-shared';

let tickCount = 0;
alt.everyTick(() => tickCount++);

/** @type {any} */
const mp = {
    prefix: globalThis.overrideBridgePrefix ?? '$bridge$', // prefix for bridge events and metas
    debug: false,
    _logWarnings: true,
    _checkNativeCalls: true,
    _forceReliable: false,
    _syncedMeta: false,
    _enableInterResourceEvents: true,
    _broadcastJoinLeave: true,
    _enableEval: true,
    _measureTimers: false, // false or threshold in ms
    _measureEvents: false, // false or threshold in ms
    _shareVariablesBetweenResources: false,
    _disableRawEmits: true,
    get _tickCount() {
        return tickCount;
    },
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
