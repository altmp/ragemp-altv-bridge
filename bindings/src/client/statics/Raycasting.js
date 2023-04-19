import * as natives from 'natives';
import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

class _Raycasting {
    #handleResult([state, hit, position, surfaceNormal, scriptID]) {
        if (state != 2 || !hit) return;
        natives.releaseScriptGuidFromEntity(scriptID);

        let entity = mp._findEntity(scriptID);
        return { position: new mp.Vector3(position), surfaceNormal: new mp.Vector3(surfaceNormal), entity };
    }

    testPointToPoint(pos1, pos2, ignoredEntity = 0, flags = -1) {
        const res = natives.startExpensiveSynchronousShapeTestLosProbe(pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z, flags, typeof ignoredEntity == 'number' ? ignoredEntity : (ignoredEntity?.handle ?? 0), 0);
        if (!res) return;
        return this.#handleResult(natives.getShapeTestResult(res));
    }

    async testPointToPointAsync(pos1, pos2, ignoredEntity = 0, flags = -1) {
        const res = natives.startShapeTestLosProbe(pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z, flags, typeof ignoredEntity == 'number' ? ignoredEntity : (ignoredEntity?.handle ?? 0), 0);
        if (!res) return;
        let cast;
        await alt.Utils.waitFor(e => {
            cast = natives.getShapeTestResult(res);
            return cast[0] !== 1;
        });
        return this.#handleResult(cast);
    }

    testCapsule(pos1, pos2, radius, ignoredEntity = 0, flags = -1) {
        this.testPointToPoint(pos1, pos2, typeof ignoredEntity == 'number' ? ignoredEntity : (ignoredEntity?.handle ?? 0), flags); // TODO: synchronous testCapsule
    }
}

mp.raycasting = new _Raycasting;
