import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import { rotToDir } from '../../shared/utils';
import { Pool } from '../Pool';

const created = {};
let list = [];
let lastId = 0;
let gameplayCam;

class _Camera {
    #gameplay;

    constructor(handle) {
        this.handle = handle;
        this.id = lastId++;
        created[this.id] = this;
        list = Object.values(created);
    }

    getPosition() {
        return new mp.Vector3(natives.getCamCoord(this.handle));
    }

    setPosition(pos) {
        natives.setCamCoord(this.handle, pos.x, pos.y, pos.z);
    }

    getDirection() {
        return new mp.Vector3(rotToDir(natives.getCamRot(this.handle, 2).toRadians()))
    }

    get pointAt() {
        return this.pointAtEntity;
    }

    get attachTo() {
        return this.attachToEntity;
    }

    destroy() {
        natives.destroyCam(this.handle, false);
    }
}

class _GameplayCamera extends _Camera {
    constructor(handle) {
        super(handle);
        Object.defineProperty(this, 'handle', { get: () => natives.getRenderingCam() });
    }

    getPosition() {
        return new mp.Vector3(natives.getGameplayCamCoord());
    }

    getCoord() {
        return this.getPosition();
    }

    getRot() {
        return natives.getGameplayCamRot();
    }
    
    getFov() {
        return natives.getGameplayCamFov();
    }

    isRendering() {
        return natives.isGameplayCamRendering();
    }

    getDirection() {
        return new mp.Vector3(rotToDir(natives.getGameplayCamRot(2).toRadians()))
    }

    destroy() {}
}

mp.Camera = _Camera;

mp.cameras = new Pool(() => list, () => list, (id) => created[id]);

mp.cameras.new = function(name, pos, rot, fov) {
    if (name == 'gameplay') {
        return gameplayCam ??= new _GameplayCamera(natives.getRenderingCam());
    }

    const handle = natives.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, fov, false, 2);
    return new _Camera(handle);
}