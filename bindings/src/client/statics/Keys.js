import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

class _Keys {
    #bound = { keydown: {}, keyup: {} };

    constructor() {
        alt.on('keydown', (key) => {
            if (alt.isMenuOpen() || alt.isConsoleOpen() || key === 119 || key === 112) return; // F8, F1
            const set = this.#bound.keydown[key];
            if (!set) return;
            for (const el of set) el();
        });
        alt.on('keyup', (key) => {
            if (alt.isMenuOpen() || alt.isConsoleOpen() || key === 119 || key === 112) return; // F8, F1
            const set = this.#bound.keyup[key];
            if (!set) return;
            for (const el of set) el();
        });
    }

    bind(code, isKeyDown, handler) {
        const obj = isKeyDown ? this.#bound.keydown : this.#bound.keyup;
        if (!(code in obj)) obj[code] = new Set();
        obj[code].add(handler);
    }

    unbind(code, isKeyDown, handler) {
        const obj = isKeyDown ? this.#bound.keydown : this.#bound.keyup;
        if (!(code in obj)) return;
        obj[code].delete(handler);
    }

    isDown(key) {
        return alt.isKeyDown(key);
    }

    isUp(key) {
        return !this.isDown(key);
    }
}

mp.keys = new _Keys;
