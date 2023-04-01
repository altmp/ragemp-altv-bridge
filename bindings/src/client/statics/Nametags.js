import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';

class _Nametags {
    enabled = false;

    #style;
    #healthStyle;

    constructor() {
        this.update();
        alt.everyTick(this.#tick.bind(this));
    }

    #tick() {
        if (!this.enabled) return;
        
        const localPlayer = alt.Player.local;
        const entity = localPlayer.vehicle ?? localPlayer;
        const frameTime = natives.getFrameTime();
        const correction = natives.getEntityVelocity(entity).mul(frameTime);
        const style = this.#style;
        const healthStyle = this.#healthStyle;

        alt.Player.streamedIn.forEach(p => {
            const offset = p.vehicle ? style.vehOffset : style.offset;
            const pos = p.pos.add(correction);
            
            alt.Utils.drawText3dThisFrame(p.name, pos.add(0, 0, offset), style.font, style.size, style.color, style.outline, true);

            if (this.#healthStyle) {
                natives.setDrawOrigin(pos.x, pos.y, pos.z + healthStyle.offset, false);
                natives.drawRect(0, 0, healthStyle.size[0], healthStyle.size[1],
                    healthStyle.bgColor.r, healthStyle.bgColor.g, healthStyle.bgColor.b, healthStyle.bgColor.a, false);
                natives.drawRect(healthStyle.size[0] * (1 - (p.health / p.maxHealth)) / -2, 0, healthStyle.size[0] * (p.health / p.maxHealth), healthStyle.size[1],
                    healthStyle.color.r, healthStyle.color.g, healthStyle.color.b, healthStyle.color.a, false);
                natives.clearDrawOrigin();
            }
        })
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
            }
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

    // todo orderByDistance
    // todo useScreen2dCoordss
}

mp.nametags = new _Nametags;