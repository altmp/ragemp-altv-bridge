import * as alt from 'alt-client';
import * as natives from 'natives';
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

    mp.events.dispatch('click', pos.x, pos.y, upOrDown, leftOrRight, pos.x, pos.y, hit ? new mp.Vector3(coords) : mp.Vector3.zero, hit ? entity : 0);
}

alt.on('keydown', (key) => {
    if (key != 0x1 && key != 0x2) return;
    dispatchClickEvent(key == 0x1 ? 'left' : 'right', 'down');
});

alt.on('keyup', (key) => {
    if (key != 0x1 && key != 0x2) return;
    dispatchClickEvent(key == 0x1 ? 'left' : 'right', 'up');
});