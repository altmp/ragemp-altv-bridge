import mp from './mp.js';
import { getValidXYZ } from './utils.js';

class _Vector3 {
    constructor(x, y, z) {
        const validXYZ = getValidXYZ(x, y, z);

        this.x = validXYZ.x;
        this.y = validXYZ.y;
        this.z = validXYZ.z;
    }

    negative() {
        return new _Vector3(-this.x,-this.y,-this.z);
    }
    add(v) {
        if (v instanceof _Vector3)
            return new _Vector3(this.x + v.x,this.y + v.y,this.z + v.z);
        else
            return new _Vector3(this.x + v,this.y + v,this.z + v);
    }
    subtract(v) {
        if (v instanceof _Vector3)
            return new _Vector3(this.x - v.x,this.y - v.y,this.z - v.z);
        else
            return new _Vector3(this.x - v,this.y - v,this.z - v);
    }
    multiply(v) {
        if (v instanceof _Vector3)
            return new _Vector3(this.x * v.x,this.y * v.y,this.z * v.z);
        else
            return new _Vector3(this.x * v,this.y * v,this.z * v);
    }
    divide(v) {
        if (v instanceof _Vector3)
            return new _Vector3(this.x / v.x,this.y / v.y,this.z / v.z);
        else
            return new _Vector3(this.x / v,this.y / v,this.z / v);
    }
    equals(v) {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        return new _Vector3(this.y * v.z - this.z * v.y,this.z * v.x - this.x * v.z,this.x * v.y - this.y * v.x);
    }
    length() {
        return Math.sqrt(this.dot(this));
    }
    unit() {
        return this.divide(this.length());
    }
    min() {
        return Math.min(Math.min(this.x, this.y), this.z);
    }
    max() {
        return Math.max(Math.max(this.x, this.y), this.z);
    }
    toAngles() {
        return [Math.asin(this.y / this.length()), Math.atan2(this.z, this.x)];
    }
    angleTo(a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }
    toArray(n) {
        return [this.x, this.y, this.z].slice(0, n || 3);
    }
    clone() {
        return new _Vector3(this.x,this.y,this.z);
    }
    init(x, y, z) {
        const validXYZ = getValidXYZ(x, y, z);

        this.x = validXYZ.x;
        this.y = validXYZ.y;
        this.z = validXYZ.z;

        return this;
    }
    toString() {
        return `{"x":${this.x},"y":${this.y},"z":${this.z}}`;
    }
}

mp.Vector3 = _Vector3;

Object.defineProperty(mp.Vector3, 'zero', {
    get() {
        return new _Vector3(0, 0, 0); // important to create the new vector on each access as the vector is mutable
    }
});
