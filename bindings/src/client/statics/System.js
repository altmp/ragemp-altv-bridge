import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

class _System {
    notify(args) {
        console.warn('Attempted to emit notification', args);
        // TODO?
    }

    get isFullscreen() {
        return false; // TODO
    }

    get isFocused() {
        return alt.isGameFocused();
    }
}

mp.system = new _System;