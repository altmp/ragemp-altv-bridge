import * as alt from 'alt-client';
import * as natives from 'natives';

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

    const corr = globalThis.getCorr();
    natives.setDrawOrigin(pos3d.x + corr.x, pos3d.y + corr.y, pos3d.z + corr.z, false);
    natives.beginTextCommandDisplayText('STRING');
    natives.addTextComponentSubstringPlayerName(text);
    natives.setTextFont(font);
    if (Array.isArray(scale)) {
        natives.setTextScale(scale[0], scale[1]);
    } else {
        natives.setTextScale(1, scale);
    }
    natives.setTextWrap(0.0, 1.0);
    natives.setTextCentre(true);
    natives.setTextColour(...color.toArray());

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
    if (Array.isArray(scale)) {
        natives.setTextScale(scale[0], scale[1]);
    } else {
        natives.setTextScale(scale, scale);
    }
    natives.setTextColour(...color.toArray());
    natives.setTextEdge(2, 0, 0, 0, 150);

    if (outline) natives.setTextOutline();
    if (dropShadow) {
        natives.setTextDropshadow(0, 0, 0, 0, 255);
        natives.setTextDropShadow();
    }

    natives.setTextCentre(true);
    natives.beginTextCommandDisplayText('CELL_EMAIL_BCON');
    // Split text into pieces of max 99 chars blocks
    (text.match(/.{1,99}/g))?.forEach((textBlock) => {
        natives.addTextComponentSubstringPlayerName(textBlock);
    });

    natives.endTextCommandDisplayText(pos2d.x, pos2d.y, 0);
};
