import * as alt from 'alt-shared';
import mp from './mp.js';

export const vdist2 = (v1, v2, useZ = true) => {
    if (!v1 || !v2) {
        return -1;
    }

    let dx = (v1.x ?? 0) - (v2.x ?? 0);
    let dy = (v1.y ?? 0) - (v2.y ?? 0);
    let dz = useZ ? (v1.z ?? 0) - (v2.z ?? 0) : 0;

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

        switch (obj[internalName('dataType')]) {
            case 'date':
                return new Date(obj.value);
        }

        if (obj.constructor && obj.constructor.name === 'Object') {
            if (obj._passAsIs) return obj;
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

        if (obj instanceof Date) {
            return {
                [internalName('dataType')]: 'date',
                value: obj.valueOf()
            };
        }

        if (Array.isArray(obj)) {
            return obj.map(toAlt);
        }

        if (obj.constructor && obj.constructor.name === 'Object') {
            if (obj._passAsIs) return obj;
            const newObj = {};
            for (const key of Object.keys(obj)) {
                newObj[key] = toAlt(obj[key]);
            }
            return newObj;
        }

        if (typeof obj === 'function') {
            return null;
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
    if (typeof value != 'string') return value >>> 0;
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

export class TickCacheContainer {
    _value;
    _updateTick;

    set(value) {
        this._updateTick = mp._tickCount;
        this._value = value;
        return value;
    }

    get(getter) {
        if (this._updateTick === mp._tickCount) return this._value;
        if (!getter) return null;
        return this.set(getter());
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

export const safeExecute = async (fn, what, bind, ...args) => {
    try {
        return await fn.apply(bind, args);
    } catch (err) {
        console.error('Error executing ' + what, err);
        mp._notifyError(err, 'unknown', 0, err.stack);
    }
};

export const emit = (event, ...args) => {
    return alt.emit(event, ...args);
    // if (mp._disableRawEmits) return alt.emit(event, ...args);
    // return alt.emitRaw(event, ...args);
};

export const internalName = (event) => {
    return mp.prefix + event;
};

export const emitInternal = (event, ...args) => {
    return emit(internalName(event), ...args);
};

export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

export const getValidXYZ = (x, y, z) => {
    if (typeof x === 'object' && x != null) {
        const item = x;
        if (Array.isArray(item)) {
            x = item[0] || 0;
            y = item[1] || 0;
            z = item[2] || 0;
        } else {
            x = item.x || 0;
            y = item.y || 0;
            z = item.z || 0;
        }
    }

    if (typeof x === 'number') {
        x = x || 0;
        y = y || 0;
        z = z || 0;
    } else if (typeof x === 'string') {
        x = parseFloat(x) || 0;
        y = parseFloat(y) || 0;
        z = parseFloat(z) || 0;
    } else {
        x = 0;
        y = 0;
        z = 0;
    }

    if (isNaN(x)) x = NaN;
    if (isNaN(y)) y = NaN;
    if (isNaN(z)) z = NaN;

    return { x, y, z };
};
