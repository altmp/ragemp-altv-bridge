import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../shared/mp.js';
import {internalName} from '../shared/utils';

export function getRenderCorrection() {
    const localPlayer = alt.Player.local;
    const entity = localPlayer.vehicle ?? localPlayer;
    const frameTime = natives.getFrameTime();
    return natives.getEntityVelocity(entity).mul(frameTime);
}
globalThis.getCorr = getRenderCorrection;

export const drawText3d = (
    text,
    pos3d,
    font = 0,
    scale = 0.5,
    color = new alt.RGBA(255, 255, 255),
    outline = true,
    dropShadow = true) => {

    const corr = globalThis.getCorr() || { x: 0, y: 0, z: 0 };
    natives.setDrawOrigin(
        pos3d.x + corr.x,
        pos3d.y + corr.y,
        pos3d.z + (corr.z || 0),
        false
    );

    natives.beginTextCommandDisplayText('CELL_EMAIL_BCON');
    (text.match(/.{1,99}/g))?.forEach((textBlock) => {
        natives.addTextComponentSubstringPlayerName(textBlock);
    });

    natives.setTextFont(font);
    natives.setTextScale(scale || 1, scale || 1);

    natives.setTextWrap(0.0, 1.0);
    natives.setTextCentre(true);

    const colorArray = color.toArray();
    natives.setTextColour(
        colorArray[0] || 255,
        colorArray[1] || 255,
        colorArray[2] || 255,
        colorArray[3] || 255
    );

    if (outline) natives.setTextOutline();
    if (dropShadow) {
        natives.setTextDropshadow(0, 0, 0, 0, 255);
        natives.setTextDropShadow();
    }

    natives.endTextCommandDisplayText(0, 0, 0);
    natives.clearDrawOrigin();
};

export const drawText2d = function(
    text,
    pos2d = new alt.Vector2(0.5),
    font = 0,
    scale = 0.5,
    color = new alt.RGBA(255, 255, 255),
    outline = true,
    dropShadow = true,
) {
    natives.setTextFont(font);
    natives.setTextProportional(false);

    natives.setTextScale(scale || 1, scale || 1);

    const colorArray = color.toArray();
    natives.setTextColour(
        colorArray[0] || 255,
        colorArray[1] || 255,
        colorArray[2] || 255,
        colorArray[3] || 255
    );
    
    natives.setTextEdge(2, 0, 0, 0, 150);

    if (outline) natives.setTextOutline();
    if (dropShadow) {
        natives.setTextDropshadow(0, 0, 0, 0, 255);
        natives.setTextDropShadow();
    }

    natives.setTextCentre(true);
    natives.beginTextCommandDisplayText('CELL_EMAIL_BCON');
    (text.match(/.{1,99}/g))?.forEach((textBlock) => {
        natives.addTextComponentSubstringPlayerName(textBlock);
    });

    natives.endTextCommandDisplayText(pos2d.x, pos2d.y, 0);
};

export const emitServer = (event, ...args) => {
    if (mp._disableRawEmits) return alt.emitServer(event, ...args);
    return alt.emitServerRaw(event, ...args);
};

export const emitServerUnreliable = (event, ...args) => {
    if (mp._enableUnreliableEmits) return alt.emitServerUnreliable(event, ...args);
    emitServer(event, ...args);
};

export const emitServerInternal = (event, ...args) => {
    return alt.emitServerRaw(internalName(event), ...args);
};
