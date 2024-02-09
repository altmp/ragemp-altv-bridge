import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import {drawText3d, getRenderCorrection} from '../clientUtils';

class _Nametags {
    enabled = false;

    #style;
    #healthStyle;

    constructor() {
        this.update();
        alt.everyTick(this.#tick.bind(this));
    }

    #tick() {
        const correction = getRenderCorrection();
        const localPos = alt.Player.local.pos;
        const style = this.#style;
        const healthStyle = this.#healthStyle;

        let arr = [];
        alt.Player.streamedIn.forEach(p => {
            if (!p.valid) return;

            const offset = 1 + ((p.vehicle ? style.vehOffset : style.offset) || 0);
            const pos = p.pos.add(0, 0, offset);
            if (!alt.isPointOnScreen(p.pos)) return;

            const dist = pos.distanceToSquared(localPos);
            if (this.useScreen2dCoords) {
                const res = alt.getScreenResolution();
                const screenPos = alt.worldToScreen(pos);
                arr.push([p.mp, screenPos.x / res.x, screenPos.y / res.y, dist]);
            } else {
                arr.push([p.mp, pos.x, pos.y, pos.z, dist]);
            }
        });

        if (this.useScreen2dCoords) {
            if (this.orderByDistance) arr.sort((a, b) => a[3] - b[3]);
        } else {
            if (this.orderByDistance) arr.sort((a, b) => a[4] - b[4]);
        }

        mp.events.dispatchLocal('render', arr);

        if (!this.enabled) return;

        alt.Player.streamedIn.forEach(p => {
            if (!p.valid) return;

            const offset = p.vehicle ? style.vehOffset : style.offset;
            const pos = p.pos.add(correction);

            drawText3d(p.name, pos.add(0, 0, offset), style.font, style.size, style.color, style.outline, true);

            if (this.#healthStyle) {
                natives.setDrawOrigin(pos.x, pos.y, pos.z + healthStyle.offset, false);
                natives.drawRect(0, 0, healthStyle.size[0], healthStyle.size[1],
                    healthStyle.bgColor.r, healthStyle.bgColor.g, healthStyle.bgColor.b, healthStyle.bgColor.a, false);
                natives.drawRect(healthStyle.size[0] * (1 - (p.health / p.maxHealth)) / -2, 0, healthStyle.size[0] * (p.health / p.maxHealth), healthStyle.size[1],
                    healthStyle.color.r, healthStyle.color.g, healthStyle.color.b, healthStyle.color.a, false);
                natives.clearDrawOrigin();
            }
        });
    }

    update(font = 6, outline = true, size = 0.5, offset = 0.7, vehOffset = 1, color = [255, 255, 255, 255],
        healthSize = [0.06, 0.008], healthColor = [255, 255, 255, 255], healthBgColor = [255, 255, 255, 64], healthOffset = 0.5, healthBorder = false) {

        this.#style = {
            font, outline, size, offset, vehOffset,
            color: new alt.RGBA(color)
        };

        if (healthSize != null) {
            this.#healthStyle = {
                size: healthSize,
                offset: healthOffset,
                border: healthBorder,
                color: new alt.RGBA(healthColor),
                bgColor: new alt.RGBA(healthBgColor)
            };
        }
    }

    set(style) {
        if (!style) return;
        const hbar = style.hbar;
        if (hbar) {
            this.update(style.font, style.outline, style.size, style.offset, style.veh_offset, style.color, hbar.size, hbar.color, hbar.bg_color, hbar.offset, hbar.border);
        } else {
            this.update(style.font, style.outline, style.size, style.offset, style.veh_offset, style.color);
        }
    }

    orderByDistance = false;
    useScreen2dCoords = true;
    // todo orderByDistance
    // todo useScreen2dCoordss
}

mp.nametags = new _Nametags;
