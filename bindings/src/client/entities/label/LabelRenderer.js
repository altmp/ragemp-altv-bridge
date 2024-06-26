import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../../shared/mp.js';
import {drawText3d, getRenderCorrection} from '../../clientUtils';

const labels = new Set();

export class LabelRenderer {
    active = false;
    color = alt.RGBA.white;
    drawDistance = 100;
    font = 4;
    los = false;
    text = '';
    pos = alt.Vector3.zero;

    constructor(posGetter) {
        this.posGetter = posGetter;
    }

    render(camPos, correction) {
        const pos = this.posGetter();

        if (this.los) {
            if (mp.raycasting.testPointToPoint(camPos, pos, 0, -1)) return;
        }

        drawText3d(this.text, pos.add(correction), this.font, 0.5, this.color, true, false);
    }

    setActive(state) {
        if (state) labels.add(this);
        else labels.delete(this);
    }

    destroy() {
        this.setActive(false);
    }

    static renderAll() {
        const camPos = new mp.Vector3(natives.getFinalRenderedCamCoord());
        const correction = getRenderCorrection();

        for (const label of labels) {
            label.render(camPos, correction);
        }
    }
}

alt.everyTick(() => LabelRenderer.renderAll());
