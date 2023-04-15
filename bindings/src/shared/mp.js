import * as alt from 'alt-shared';

/** @type {any} */
const mp = {
    prefix: globalThis.overrideBridgePrefix ?? '$bridge$', // prefix for bridge events and metas
    joaat: (model) => alt.hash(model),
    debug: false
};
export default mp;
