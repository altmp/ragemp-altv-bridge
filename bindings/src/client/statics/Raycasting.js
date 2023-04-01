import * as natives from 'natives';
import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

class _Raycasting {
    // todo check if raycasts return RAGEMP objects or script ids

    testPointToPoint(pos1, pos2, ignoredEntity = 0, flags = -1) {
        const res = natives.startExpensiveSynchronousShapeTestLosProbe(pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z, flags, ignoredEntity, 0);
        if (!res) return;
        const cast = natives.getShapeTestResult(res);
        if (cast[0] != 2) return;
        if (!cast[1]) return;
        return { position: cast[2], surfaceNormal: cast[3], entity: cast[4] };
    }

    async testPointToPointAsync(pos1, pos2, ignoredEntity = 0, flags = -1) {
        const res = natives.startShapeTestLosProbe(pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z, flags, ignoredEntity, 0);
        if (!res) return;
        let cast;
        await alt.Utils.waitFor(e => {
            cast = natives.getShapeTestResult(res);
            return cast[0] != 1;
        });
        if (cast[0] != 2) return;
        if (!cast[1]) return;
        return { position: cast[2], surfaceNormal: cast[3], entity: cast[4] };
    }

    testCapsule(pos1, pos2, radius, ignoredEntity = 0, flags = -1) {
        this.testPointToPoint(pos1, pos2, ignoredEntity, flags); // TODO: synchronous testCapsule
    }
}

mp.raycasting = new _Raycasting;