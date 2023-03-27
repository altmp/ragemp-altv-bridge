import * as alt from "alt-server";
import { _WorldObject } from "./WorldObject";

export class _Entity extends _WorldObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
    }
    
    setStreamVariable(key, value) {
        if (typeof key === "object") {
            for (const [innerKey, innerValue] of Object.entries(key)) this.setStreamVariable(innerKey, innerValue);
            return;
        }

        this.#alt.setStreamSyncedMeta(key, value);
    }
    
    setStreamVariables(obj) {
        this.setStreamVariable(obj);
    }

    getStreamVariable(key) {
        return this.#alt.getStreamSyncedMeta(key);
    }
}