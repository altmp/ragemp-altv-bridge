import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { Pool } from '../Pool.js';
import { _Entity } from './Entity.js';

export class _Player extends _Entity {
    alt;

    /** @param {alt.Player} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get handle() {
        return this.alt.scriptID;
    }

    get remoteId() {
        return this.alt.remoteId;
    }

    get position() {
        return new mp.Vector3(this.alt.position);
    }

    get vehicle() {
        return this.alt.vehicle?.mp ?? null;
    }

    get name() {
        return this.alt.name;
    }

    get model() {
        return this.alt.model;
    }

    get voiceVolume() {
        return this.alt.spatialVolume; // TODO: what to do with non spatial volume?
    }

    set voiceVolume(value) {
        this.alt.spatialVolume = value;
        this.alt.nonSpatialVolume = value;
    }

    get isPlayerTalking() {
        return this.alt.isTalking;
    }

    // TODO: isTypingInTextChat
    // TODO: isPositionFrozen
    // TODO: voiceAutoVolume
    // TODO: voice3d

    // TODO: removeVoiceFx
    // TODO: resetVoiceFx
    // TODO: setVoiceFx*
    
    get type() {
        return 'player';
    }
}

Object.defineProperty(alt.Player.prototype, 'mp', { 
    get() {
        return this._mp ??= new _Player(this);
    } 
});

mp.Player = _Player;

mp.players = new Pool(() => alt.Player.all, () => alt.Player.streamedIn, alt.Player.getByID);

mp.players.local = alt.Player.local.mp;

mp.players.atHandle = function(handle) {
    return alt.Player.getByScriptID(handle)?.mp ?? null;
}