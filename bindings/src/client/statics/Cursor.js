import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

class _Cursor {
    show(freezeControls, state) {
        // Workaround to mimic RAGEMP's behavior
        // alt:V does cursor counting, cursor had to be
        // disabled the amount of times it was enabled

        if (state) {
            while (!alt.isCursorVisible()) alt.showCursor(true);
        } else {
            while (alt.isCursorVisible()) alt.showCursor(false);
        }

        alt.toggleGameControls(!freezeControls);
    }

    get visible() {
        return alt.isCursorVisible();
    }

    get position() {
        const pos = alt.getCursorPos();
        return { x: pos.x, y: pos.y };
    }
}

mp.gui.cursor = new _Cursor;