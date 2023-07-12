/* global alt */

const mp = {
    prefix: globalThis.overrideBridgePrefix ?? '$bridge$'
};

mp.trigger = (event, ...args) => {
    alt.emit(mp.prefix + 'event', event, ...args);
};

mp.invoke = (event, arg) => {
    if (event === 'command') alt.emit(mp.prefix + 'chat', '/' + arg);
    if (event === 'chatMessage') alt.emit(mp.prefix + 'chat', arg);
};

const handlers = {};

mp.events = {};

mp.events.add = function (event, fn) {
    if (!(event in handlers)) handlers[event] = new Set;
    handlers[event].add(fn);
};

mp.events.remove = function(event, fn) {
    if (!(event in handlers)) return;
    handlers[event].delete(fn);
};

alt.on(mp.prefix + 'event', (event, ...args) => {
    if (!(event in handlers)) return;
    for (const handler of handlers[event]) {
        handler(...args);
    }
});

globalThis.mp = mp;

alt.on(mp.prefix + 'eval', (code) => {
    [eval][0](code);
});

const evts = ';pointer-events:none;';

alt.on(mp.prefix + 'receiveEvents', (state) => {
    const prev = document.body.getAttribute('style')?.replaceAll(evts, '');
    document.body.setAttribute('style', state ? prev : (prev + evts));
});

alt.emit(mp.prefix + 'ready');

window.experiment_a = true;
