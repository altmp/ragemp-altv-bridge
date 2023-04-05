import * as alt from 'alt-client';
import * as natives from 'natives';

export function getRenderCorrection() {
    const localPlayer = alt.Player.local;
    const entity = localPlayer.vehicle ?? localPlayer;
    const frameTime = natives.getFrameTime();
    return natives.getEntityVelocity(entity).mul(frameTime);
}