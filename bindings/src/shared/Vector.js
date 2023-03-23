import mp from "./mp.js";

class _Vector3 {
    constructor(x, y, z) {
        if (typeof z !== 'undefined') {
            this.x = x || 0.0;
            this.y = y || 0.0;
            this.z = z || 0.0;
        } else if (typeof x === 'object') {
            if (Array.isArray(x)) {
                this.x = x[0];
                this.y = x[1];
                this.z = x[2];
            } else {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
            }
        }
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
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    toString() {
        return `{"x":${this.x},"y":${this.y},"z":${this.z}}`;
    }
}

mp.Vector3 = _Vector3;
