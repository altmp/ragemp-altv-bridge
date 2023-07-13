import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';

class _Cursor {
    #tick;
    _controlDisabled = false;

    show(freezeControls, state) {
        // Workaround to mimic RAGEMP's behavior
        // alt:V does cursor counting, cursor had to be
        // disabled the amount of times it was enabled

        if (state) {
            while (!alt.isCursorVisible()) alt.showCursor(true);
        } else {
            while (alt.isCursorVisible()) alt.showCursor(false);
        }

        this._controlDisabled = freezeControls;
        // alt.toggleGameControls(!freezeControls);

        // alt.WebView.all.forEach(e => e.emit(mp.prefix + 'receiveEvents', state));
    }

    get visible() {
        return alt.isCursorVisible();
    }

    set visible(state) {
        this.show(state, state);
    }

    get position() {
        const pos = alt.getCursorPos();
        return [ pos.x, pos.y ];
    }

    set position(pos) {
        if (Array.isArray(pos)) pos = { x: pos[0], y: pos[1] };
        alt.setCursorPos(pos, false);
    }
}

mp.gui.cursor = new _Cursor;

function dispatchClickEvent(leftOrRight, upOrDown) {
    if (!mp.events.hasHandlers('click')) return;

    const pos = alt.getCursorPos();
    const world = alt.screenToWorld(pos);
    const camPos = alt.getCamPos();
    const dir = world.sub(camPos);
    const from = camPos.add(dir.mul(0.05));
    const to = camPos.add(dir.mul(10000));
    const ray = natives.startExpensiveSynchronousShapeTestLosProbe(from.x, from.y, from.z, to.x, to.y, to.z, -1, alt.Player.local, 0);
    const [, hit, coords, , entity] = natives.getShapeTestResult(ray);

    mp.events.dispatchLocal('click', pos.x, pos.y, upOrDown, leftOrRight, pos.x, pos.y, hit ? new mp.Vector3(coords) : mp.Vector3.zero, hit ? entity : 0);
}

alt.on('keydown', (key) => {
    if (key != 0x1 && key != 0x2) return;
    dispatchClickEvent(key == 0x1 ? 'left' : 'right', 'down');
});

alt.on('keyup', (key) => {
    if (key != 0x1 && key != 0x2) return;
    dispatchClickEvent(key == 0x1 ? 'left' : 'right', 'up');
});

alt.everyTick(() => {
    if (mp.gui.cursor._controlDisabled) {
        natives.disableAllControlActions(0);
        natives.disableAllControlActions(2);
    }
});
