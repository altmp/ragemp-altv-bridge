// If global.mp exits, then it's not alt:V
if (globalThis.mp) {
    throw new Error('This is not alt:V');
}

import "../shared/index.js";
// TODO: Import entities
import "./natives.js"
import "./extraNatives.js"
