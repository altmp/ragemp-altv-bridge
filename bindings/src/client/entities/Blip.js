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
        return this.alt.scriptID;
    }

    type = 'blip';

    destroy() {
        this.alt.destroy();
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

    get setNameFromTextFile() {
        return this.setBlipNameFromTextFile; // setBlipNameFromTextFile
    }

    get setCoords() {
        return this.setBlipCoords; // setBlipCoords
    }

    get setScale() {
        return this.setBlipScale; // setBlipScale
    }

    get setRotation() {
        return this.setBlipRotation; // setBlipRotation
    }

    getNextInfoId() {
        return natives.getNextBlipInfoId(this.handle);
    }

    getFirstInfoId() {
        return natives.getFirstBlipInfoId(this.handle);
    }

    isMissionCreator() {
        return natives.isMissionCreatorBlip(this.handle);
    }

    hideNumberOn() {
        return natives.hideNumberOnBlip(this.handle);
    }

    showNumberOn() {
        return natives.showNumberOnBlip(this.handle);
    }

    setShowHeadingIndicator(state) {
        return natives.showHeadingIndicatorOnBlip(this.handle, state);
    }

    pulse() {
        return natives.pulseBlip(this.handle);
    }

    addTextComponentSubstringName() {
        return natives.addTextComponentSubstringBlipName(this.handle);
    }

    endTextCommandSetName() {
        return natives.endTextCommandSetBlipName(this.handle);
    }
    //#endregion
}

Object.defineProperty(alt.Blip.prototype, 'mp', {
    get() {
        return this._mp ??= new _Blip(this);
    }
});

mp.Blip = _Blip;

mp.blips = new ClientPool(EntityGetterView.fromClass(alt.Blip));

mp.blips.new = function(sprite, position, params = {}) {
    const blip = sprite === 9
        ? new alt.RadiusBlip(position.x, position.y, position.z, params.radius ?? 100)
        : new alt.PointBlip(position.x, position.y, position.z);
    if (sprite !== 9) blip.sprite = sprite;

    if ('name' in params) {
        blip.name = params.name;
        // blip.gxtName = params.name;
    }
    if ('scale' in params) blip.scale = params.scale;
    if ('color' in params) blip.color = params.color;
    if ('alpha' in params) blip.alpha = params.alpha;
    // TODO: draw distance
    if ('shortRange' in params) blip.shortRange = params.shortRange;
    if ('rotation' in params) blip.heading = params.rotation;
    // TODO: dimension

    return blip.mp;
};
