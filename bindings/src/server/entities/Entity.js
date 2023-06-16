import * as alt from 'alt-server';
import { _WorldObject } from './WorldObject';
import {TemporaryContainer, toAlt, toMp} from '../../shared/utils';
import mp from '../../shared/mp';

export class _Entity extends _WorldObject {
    #alt;

    /** @param {alt.Entity} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
    }

    setStreamVariable(key, value) {
        if (typeof key === 'object' && key) {
            for (const [innerKey, innerValue] of Object.entries(key)) this.setStreamVariable(innerKey, innerValue);
            return;
        }

        this.#alt.setStreamSyncedMeta(key, toAlt(value));
    }

    setStreamVariables(obj) {
        this.setStreamVariable(obj);
    }

    getStreamVariable(key) {
        return toMp(this.#alt.getStreamSyncedMeta(key));
    }

    hasStreamVariable(key) {
        return this.#alt.hasStreamSyncedMeta(key);
    }

    _position = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    get position() {
        return this._position.value ?? new mp.Vector3(this.alt.pos);
    }
    set position(value) {
        this._position.value = this.alt.pos = value;
    }

    _rotation = new TemporaryContainer(() => this.alt.valid && this.alt.getTimestamp);
    get rotation() {
        return this._rotation.value ?? new mp.Vector3(this.alt.rot.toDegrees());
    }
    set rotation(value) {
        this._rotation.value = this.alt.pos = new alt.Vector3(value).toRadians();
    }
}
