import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import { rotToDir } from '../../shared/utils';
import { ClientPool } from '../ClientPool';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';

const view = new EntityStoreView();

class _Camera {
    constructor(handle) {
        this.handle = handle;
        this.id = view.getId();
        view.add(this, this.id, handle);
    }

    type = 'camera';

    get position() {
        return this.getPosition();
    }

    set position(value) {
        this.setPosition(value);
    }

    destroy() {
        view.remove(this.id, this.handle);
        natives.destroyCam(this.handle, false);
    }

    getPosition() {
        return new mp.Vector3(natives.getCamCoord(this.handle));
    }

    setPosition(pos) {
        natives.setCamCoord(this.handle, pos.x, pos.y, pos.z);
    }

    getDirection() {
        return new mp.Vector3(rotToDir(natives.getCamRot(this.handle, 2).toRadians()));
    }

    get pointAt() {
        return this.pointAtEntity;
    }

    get attachTo() {
        return this.attachToEntity;
    }

    setActive(value) {
        natives.setCamActive(this.handle, value);
        if (value) natives.renderScriptCams(true, false, 0, true, false, 0);
    }

    get valid() {
        return this.handle !== 0;
    }
}

class _GameplayCamera extends _Camera {
    constructor(handle) {
        super(handle);
        Object.defineProperty(this, 'handle', { get: () => natives.getRenderingCam() });
    }

    get position() {
        return this.getPosition();
    }

    getPosition() {
        return new mp.Vector3(natives.getGameplayCamCoord());
    }

    getCoord() {
        return this.getPosition();
    }

    getRot() {
        return natives.getGameplayCamRot(2);
    }

    getFov() {
        return natives.getGameplayCamFov();
    }

    isRendering() {
        return natives.isGameplayCamRendering();
    }

    getDirection() {
        return new mp.Vector3(rotToDir(natives.getGameplayCamRot(2).toRadians()));
    }

    destroy() {}

    get valid() {
        return true;
    }
}

mp.Camera = _Camera;

mp.cameras = new ClientPool(view, [_Camera, _GameplayCamera]);

// smart getter
Object.defineProperty(mp.cameras, 'gameplay', {
    get() {
        delete mp.cameras.gameplay;
        return mp.cameras.gameplay = new _GameplayCamera(natives.getRenderingCam());
    },
    configurable: true
});

const validNames = [
    'DEFAULT_SCRIPTED_CAMERA',
    'DEFAULT_ANIMATED_CAMERA',
    'DEFAULT_SPLINE_CAMERA',
    'DEFAULT_SCRIPTED_FLY_CAMERA',
    'TIMED_SPLINE_CAMERA',
    'CUSTOM_TIMED_SPLINE_CAMERA',
    'ROUNDED_SPLINE_CAMERA',
    'SMOOTHED_SPLINE_CAMERA'
];

mp.cameras.new = function(name, pos = mp.Vector3.zero, rot = mp.Vector3.zero, fov = natives.getGameplayCamFov()) {
    if (name === 'gameplay') {
        return mp.cameras.gameplay;
    }

    const handle = natives.createCamWithParams(validNames.includes(name) ? name : 'DEFAULT_SCRIPTED_CAMERA', pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, fov, false, 2);
    natives.setCamActive(handle, true);
    return new _Camera(handle);
};
