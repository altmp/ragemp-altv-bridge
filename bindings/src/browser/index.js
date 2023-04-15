/* global alt */
const mp = {
    prefix: globalThis.overrideBridgePrefix ?? '$bridge$'
};

mp.trigger = (event, ...args) => {
    alt.emit(mp.prefix + 'event', event, ...args);
};

globalThis.mp = mp;

alt.on(mp.prefix + 'eval', (code) => {
    [eval][0](code);
});

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

docReady(() => {
    alt.emit(mp.prefix + 'browserDomReady');
});
