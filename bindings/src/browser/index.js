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

let receiveEvents = true;
alt.on(mp.prefix + 'receiveEvents', (state) => {
    receiveEvents = state;
});

alt.emit(mp.prefix + 'ready');

function suppress(e) {
    if (!receiveEvents) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
    }
}

document.addEventListener('keydown', suppress, true);
document.addEventListener('keyup', suppress, true);
document.addEventListener('keypress', suppress, true);
document.addEventListener('mousedown', suppress, true);
document.addEventListener('mouseup', suppress, true);
document.addEventListener('mousemove', suppress, true);
document.addEventListener('mouseenter', suppress, true);
document.addEventListener('mouseleave', suppress, true);
document.addEventListener('mouseover', suppress, true);
document.addEventListener('mouseout', suppress, true);
document.addEventListener('click', suppress, true);
document.addEventListener('dblclick', suppress, true);
document.addEventListener('contextmenu', suppress, true);
document.addEventListener('wheel', suppress, true);
document.addEventListener('pointerdown', suppress, true);
document.addEventListener('pointerup', suppress, true);
document.addEventListener('pointermove', suppress, true);
document.addEventListener('pointerenter', suppress, true);
document.addEventListener('pointerleave', suppress, true);
document.addEventListener('pointerover', suppress, true);
document.addEventListener('pointerout', suppress, true);
