import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import {drawText3d, getRenderCorrection} from '../clientUtils';
import {BaseObjectType} from '../../shared/BaseObjectType';

class _Nametags {
    enabled = false;

    #style;
    #healthStyle;
    #streamedPlayers = [];
    #isNametagsProcessDisabled = false;

    constructor() {
        this.update();
        alt.everyTick(this.#tick.bind(this));

        alt.on('gameEntityCreate', (entity) => {
            if (this.#isNametagsProcessDisabled) return;

            if (entity && entity.type === BaseObjectType.Player) {
                this.#streamedPlayers.push(entity);
            }
        });

        alt.on('gameEntityDestroy', (entity) => {
            if (this.#isNametagsProcessDisabled) return;

            if (entity && entity.type === BaseObjectType.Player) {
                const index = this.#streamedPlayers.indexOf(entity);
                if (index !== -1) this.#streamedPlayers.splice(index, 1);
            }
        });

        alt.on('baseObjectRemove', (entity) => {
            if (this.#isNametagsProcessDisabled) return;

            if (entity && entity.type === BaseObjectType.Player) {
                const index = this.#streamedPlayers.indexOf(entity);
                if (index !== -1) this.#streamedPlayers.splice(index, 1);
            }
        });
    }

    #tick() {
        if (this.#isNametagsProcessDisabled) {
            mp.events.dispatchLocal('render');
            return;
        }

        const correction = getRenderCorrection();
        const res = alt.getScreenResolution();
        const localPos = alt.Player.local.pos;
        const style = this.#style;
        const healthStyle = this.#healthStyle;

        const players = this.#streamedPlayers;
        const length = players.length;
        let arr = [];

        for (let i = 0; i < length; i++) {
            const player = players[i];
            if (!player.valid) continue;

            const offset = 1 + ((player.vehicle ? style.vehOffset : style.offset) || 0);
            const pos = player.pos.add(0, 0, offset);
            if (!alt.isPointOnScreen(player.pos)) continue;

            const dist = pos.distanceToSquared(localPos);
            if (this.useScreen2dCoords) {
                const screenPos = alt.worldToScreen(pos);
                arr.push([player.mp, screenPos.x / res.x, screenPos.y / res.y, dist]);
            } else {
                arr.push([player.mp, pos.x, pos.y, pos.z, dist]);
            }
        }

        if (this.useScreen2dCoords && arr.length) {
            if (this.orderByDistance) arr.sort((a, b) => a[3] - b[3]);
        } else {
            if (this.orderByDistance) arr.sort((a, b) => a[4] - b[4]);
        }

        mp.events.dispatchLocal('render', arr);

        if (!this.enabled) return;

        const arrLength = arr.length;
        for (let i = 0; i < arrLength; i++) {
            const p = arr[i][0];

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
        }
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

    /**
     * Enables or disables the nametags rendering process.
     * @param {boolean} bool - If true, enables the nametags rendering process; if false, disables it.
     */
    set returnRenderNametags(bool) {
        this.#isNametagsProcessDisabled = !bool;

        if (this.#isNametagsProcessDisabled) {
            this.#streamedPlayers = [];
        }
    }
}

mp.nametags = new _Nametags;
