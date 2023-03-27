import * as alt from "alt-server";
import { vdist, vdist2 } from "../../shared/utils";
import { _BaseObject } from "./BaseObject";

export class _WorldObject extends _BaseObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        this.#alt = alt;
    }

    setVariable(key, value) {
        if (typeof key === "object") {
            for (const [innerKey, innerValue] of Object.entries(key)) this.setVariable(innerKey, innerValue);
            return;
        }

        this.#alt.setSyncedMeta(key, value);
    }
    
    setVariables(obj) {
        this.setVariable(obj);
    }

    getVariable(key) {
        return this.#alt.getSyncedMeta(key);
    }

    dist(pos) {
        return vdist(this.alt.pos, pos);
    }

    distSquared(pos) {
        return vdist2(this.alt.pos, pos);
    }

    get dimension() {
        return this.alt.dimension;
    }

    set dimension(value) {
        this.alt.dimension = value;
    }

    get id() {
        return this.alt.id;
    }
}