import * as alt from 'alt-shared';

export const vdist2 = (v1, v2, useZ = true) => {
    if (!v1 || !v2) {
        return -1;
    }

    let dx = v1.x - v2.x;
    let dy = v1.y - v2.y;
    let dz = useZ ? v1.z - v2.z : 0;

    return (dx * dx + dy * dy + dz * dz);
}

export const vdist = (v1, v2, useZ = true) => {
    return Math.sqrt(vdist2(v1, v2, useZ));
}

export const argsToMp = (args) => {
    for (let i = 0; i < args.length; i++) {
        const el = args[i];
        if (typeof el === 'object' && el instanceof alt.BaseObject && el.mp) {
            args[i] = el.mp;
        }
    }
    return args;
}

export const argsToAlt = (args) => {
    for (let i = 0; i < args.length; i++) {
        const el = args[i];
        if (typeof el === 'object' && el.isMpWrapper) {
            args[i] = el.alt;
        }
    }
    return args;
}

// alt.Vector3, rotation in radians
export const rotToDir = (rot) => {
    return new alt.Vector3(
        -Math.sin(rot.z) * Math.abs(Math.cos(rot.x)),
        Math.cos(rot.z) * Math.abs(Math.cos(rot.x)),
        Math.sin(rot.x)
    );
}

export const rad2deg = 180 / Math.PI;
export const deg2rad = Math.PI / 180;