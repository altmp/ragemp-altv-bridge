import * as alt from 'alt-shared';

/** @type {any} */
const mp = {
    prefix: globalThis.overrideBridgePrefix ?? '$bridge$', // prefix for bridge events and metas
    debug: false,
    _objectStreamRange: 1000
};

// TODO: find a way to specify custom main resource name
mp._main = 'client_resources' === alt.resourceName;

export default mp;
