import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { ClientPool } from '../ClientPool.js';
import { _WorldObject } from './WorldObject.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import * as natives from 'natives';
export class _Blip extends _WorldObject {
    /** @param {alt.Blip} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get handle() {
        if (!this.alt.valid) return 0;
        if (!this.alt.isStreamedIn) return -this.alt.id;
        return this.alt.scriptID;
    }

    type = 'blip';

    get radius() {
        if (!this.alt.valid) return 0;
        return this.alt.radius ?? this.alt.size.x / 2;
    }

    set radius(value) {
        if (!this.alt.valid) return;
        if (this.alt.radius != null) this.alt.radius = value;
        else this.alt.size = new alt.Vector2(value * 2, value * 2);
    }

    get position() {
        if (!this.alt.valid) return mp.Vector3.zero;
        return this.alt.pos;
    }

    set position(value) {
        if (!this.alt.valid) return;
        this.alt.pos = value;
    }

    setCoords(x, y, z) {
        if (!this.alt.valid) return;
        if (typeof x === 'number') this.alt.pos = new alt.Vector3(x, y, z);
        else if (typeof x === 'string') this.alt.pos = new alt.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
        else this.alt.pos = x;
    }

    setPosition(x, y, z) {
        return this.setCoords(x, y, z);
    }

    //#region Natives
    get setColour() {
        return this.setBlipColour; // setBlipColour
    }

    get setNameToPlayerName() {
        return this.setBlipNameToPlayerName; // setBlipNameToPlayerName
    }

    get setShowCone() {
        return this.setBlipShowCone; // setBlipShowCone
    }

    get setSecondaryColour() {
        return this.setBlipSecondaryColour; // setBlipSecondaryColour
    }

    get getInfoIdDisplay() {
        return this.getBlipInfoIdDisplay; // getBlipInfoIdDisplay
    }

    get getSprite() {
        return this.getBlipSprite; // getBlipSprite
    }

    get setCategory() {
        return this.setBlipCategory; // setBlipCategory
    }

    get setAsMissionCreator() {
        return this.setBlipAsMissionCreatorBlip; // setBlipAsMissionCreatorBlip
    }

    get setFade() {
        return this.setBlipFade; // setBlipFade
    }

    get setFlashesAlternate() {
        return this.setBlipFlashesAlternate; // setBlipFlashesAlternate
    }

    get setAlpha() {
        return this.setBlipAlpha; // setBlipAlpha
    }

    get getInfoIdIndex() {
        return this.getBlipInfoIdEntityIndex; // getBlipInfoIdEntityIndex
    }

    get setRoute() {
        return this.setBlipRoute; // setBlipRoute
    }

    get getCoords() {
        return this.getBlipCoords; // getBlipCoords
    }

    get setAsFriendly() {
        return this.setBlipAsFriendly; // setBlipAsFriendly
    }

    get getHudColour() {
        return this.getBlipColour; // getBlipHudColour
    }

    get setRouteColour() {
        return this.setBlipRouteColour; // setBlipRouteColour
    }

    get setDisplay() {
        return this.setBlipDisplay; // setBlipDisplay
    }

    get getAlpha() {
        return this.getBlipAlpha; // getBlipAlpha
    }

    get getInfoIdPickupIndex() {
        return this.getBlipInfoIdPickupIndex; // getBlipInfoIdPickupIndex
    }

    get isFlashing() {
        return this.isBlipFlashing; // isBlipFlashing
    }

    get doesExist() {
        return this.doesBlipExist; // doesBlipExist
    }

    get setFlashInterval() {
        return this.setBlipFlashInterval; // setBlipFlashInterval
    }

    get setPriority() {
        return this.setBlipPriority; // setBlipPriority
    }

    get setFlashes() {
        return this.setBlipFlashes; // setBlipFlashes
    }

    get setBright() {
        return this.setBlipBright; // setBlipBright
    }

    get setAsShortRange() {
        return this.setBlipAsShortRange; // setBlipAsShortRange
    }

    get getInfoIdType() {
        return this.getBlipInfoIdType; // getBlipInfoIdType
    }

    get setFlashTimer() {
        return this.setBlipFlashTimer; // setBlipFlashTimer
    }

    get isShortRange() {
        return this.isBlipShortRange; // isBlipShortRange
    }

    get getColour() {
        return this.getBlipColour; // getBlipHudColour
    }

    get setSprite() {
        return this.setBlipSprite; // setBlipSprite
    }

    get setHighDetail() {
        return this.setBlipHighDetail; // setBlipHighDetail
    }

    get isOnMinimap() {
        return this.isBlipOnMinimap; // isBlipOnMinimap
    }

    setNameFromTextFile(gxt) {
        this.alt.name = mp.game.gxt.get(gxt);
    }

    get setScale() {
        return this.setBlipScale; // setBlipScale
    }

    get setRotation() {
        return this.setBlipRotation; // setBlipRotation
    }

    getNextInfoId() {
        return mp.game.hud.getNextBlipInfoId.apply(this, [this.handle]);
    }

    getFirstInfoId() {
        return mp.game.hud.getFirstBlipInfoId.apply(this, [this.handle]);
    }

    isMissionCreator() {
        return mp.game.hud.isMissionCreatorBlip.apply(this, [this.handle]);
    }

    hideNumberOn() {
        return mp.game.hud.hideNumberOnBlip.apply(this, [this.handle]);
    }

    showNumberOn(number) {
        return mp.game.hud.showNumberOnBlip.apply(this, [this.handle, number]);
    }

    setShowHeadingIndicator(state) {
        return mp.game.hud.showHeadingIndicatorOnBlip.apply(this, [this.handle, state]);
    }

    pulse() {
        return mp.game.hud.pulseBlip.apply(this, [this.handle]);
    }

    addTextComponentSubstringName() {
        return mp.game.hud.addTextComponentSubstringBlipName.apply(this, [this.handle]);
    }

    endTextCommandSetName() {
        return mp.game.hud.endTextCommandSetBlipName.apply(this, [this.handle]);
    }
    //#endregion
}

Object.defineProperty(alt.Blip.prototype, 'mp', {
    get() {
        return this._mp ??= new _Blip(this);
    }
});

mp.Blip = _Blip;

mp.blips = new ClientPool(EntityGetterView.fromClass(alt.Blip), [_Blip]);

mp.blips.new = function(sprite, position, params = {}) {
    let blip;
    switch(sprite) {
        case 9:
            blip = new alt.RadiusBlip(position.x, position.y, position.z, params.radius ?? 100);
            blip.isHiddenOnLegend = true;
            break;
        case 5: {
            blip = new alt.RadiusBlip(position.x, position.y, position.z, params.radius ?? 100);
            blip.sprite = 5;
            blip.isHiddenOnLegend = true;
            break;
        }
        default:
            blip = new alt.PointBlip(position.x, position.y, position.z);
            blip.sprite = sprite;
    }

    if ('name' in params) blip.name = params.name;
    if ('scale' in params) blip.scale = params.scale;
    if ('color' in params) blip.color = params.color;
    if ('alpha' in params) blip.alpha = params.alpha;
    // TODO: draw distance
    if ('shortRange' in params && sprite !== 5) blip.shortRange = params.shortRange;
    if ('rotation' in params) blip.heading = params.rotation;
    blip.mp.dimension = params.dimension ?? 0;

    return blip.mp;
};

alt.on('worldObjectStreamIn', (blip) => {
    if (blip instanceof alt.Blip && blip.mp._nextName) {
        natives.setBlipNameFromTextFile(blip.scriptID, blip.mp._nextName);
    }
});
