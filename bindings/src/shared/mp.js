import * as alt from 'alt-shared';

/** @type {any} */
const mp = {
    prefix: globalThis.overrideBridgePrefix ?? '$bridge$', // prefix for bridge events and metas
    debug: false,
    _objectStreamRange: 1000
};

// TODO: find a way to specify custom main resource name
mp._main = alt.Resource.current.config?.config?.['bridge-main'] ?? false;
console.log('IS MAIN: ', alt.Resource.current.name, mp._main);

export default mp;
