import * as alt from 'alt-shared';
import mp from './mp.js';

export const vdist2 = (v1, v2, useZ = true) => {
    if (!v1 || !v2) {
        return -1;
    }

    let dx = v1.x - v2.x;
    let dy = v1.y - v2.y;
    let dz = useZ ? v1.z - v2.z : 0;

    return (dx * dx + dy * dy + dz * dz);
};

export const vdist = (v1, v2, useZ = true) => {
    return Math.sqrt(vdist2(v1, v2, useZ));
};

export const toMp = (obj) => {
    if (obj && typeof obj === 'object') {
        if (obj instanceof alt.BaseObject && obj.mp) {
            return obj.mp;
        }

        if (Array.isArray(obj)) {
            return obj.map(toMp);
        }

        if (obj.constructor && obj.constructor.name === 'Object') {
            const newObj = {};
            for (const key of Object.keys(obj)) {
                newObj[key] = toMp(obj[key]);
            }
            return newObj;
        }
    }

    return obj;
};

export const toAlt = (obj) => {
    if (typeof obj === 'object' && obj) {
        if (obj?.isMpWrapper && obj.alt) {
            if ('_ignore' in obj.alt) return {};
            return obj.alt;
        }

        if (Array.isArray(obj)) {
            return obj.map(toAlt);
        }

        if (obj.constructor && obj.constructor.name === 'Object') {
            const newObj = {};
            for (const key of Object.keys(obj)) {
                newObj[key] = toAlt(obj[key]);
            }
            return newObj;
        }
    }

    return obj;
};

export const argsToMp = (args) => {
    if (!args || !Array.isArray(args)) return [];
    for (let i = 0; i < args.length; i++) {
        args[i] = toMp(args[i]);
    }
    return args;
};

export const argsToAlt = (args) => {
    if (!args || !Array.isArray(args)) return [];
    for (let i = 0; i < args.length; i++) {
        args[i] = toAlt(args[i]);
    }
    return args;
};

mp.convert = {
    toMp,
    toAlt,
    argsToMp,
    argsToAlt
};

// alt.Vector3, rotation in radians
export const rotToDir = (rot) => {
    return new alt.Vector3(
        -Math.sin(rot.z) * Math.abs(Math.cos(rot.x)),
        Math.cos(rot.z) * Math.abs(Math.cos(rot.x)),
        Math.sin(rot.x)
    );
};

export const rad2deg = 180 / Math.PI;
export const deg2rad = Math.PI / 180;

export const mpDimensionToAlt = (mpDimension) => {
    if (mpDimension === -1) return -2147483648;
    if (mpDimension < 0) throw new Error('Invalid dimension');
    return mpDimension;
};

export const altDimensionToMp = (altDimension) => {
    if (altDimension < 0) return -1;
    return altDimension;
};

export const hashIfNeeded = (value) => {
    if (typeof value != 'string') return value;
    return alt.hash(value);
};

export const altSeatToMp = (altSeat) => {
    return altSeat - 1;
};

export const mpSeatToAlt = (mpSeat) => {
    return mpSeat + 1;
};

export class TemporaryContainer {
    _timer;
    _timestamp;
    _value;

    /** @param {() => (false | number)} timestampGetter */
    constructor(timestampGetter) {
        this.timestampGetter = timestampGetter;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (this._timer) alt.clearTimer(this._timer);
        this._value = value;
        this._timestamp = this.timestampGetter();
        this._timer = alt.everyTick(() => {
            const timestamp = this.timestampGetter();
            if (timestamp === this._timestamp && timestamp) return;
            this._value = undefined;
            this._timestamp = undefined;
            alt.clearTimer(this._timer);
            this._timer = undefined;
        });
    }
}

export const schedule = (predicate, fn, timeout = 2000) => {
    if (predicate()) return void fn();
    let timer;
    const timeoutTimer = timeout ? alt.setTimeout(() => alt.clearTimer(timer), timeout) : 0;
    timer = alt.everyTick(() => {
        if (!predicate()) return;
        alt.clearTimer(timeoutTimer);
        alt.clearTimer(timer);
        fn();
    });
};
