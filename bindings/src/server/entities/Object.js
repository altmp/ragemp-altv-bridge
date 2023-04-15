import mp from '../../shared/mp';
import * as alt from 'alt-server';
import {_Entity} from './Entity';
import {Pool} from '../Pool';
import * as natives from '@altv/types-natives';

export class _Object extends _Entity {

    /** @param {alt.Object} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    destroy() {
        this.alt.destroy();
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        this.alt.pos = value;
    }

    get model() {
        return this.alt.model;
    }

    get alpha() {
        return this.alt.alpha;
    }

    set alpha(value) {
        this.alt.alpha = value;
    }

    get notifyStreaming() {
        return false;
    }

    set notifyStreaming(value) {
        // unused
    }

    // TODO: streaming range
}


mp.objects = new Pool(() => alt.Object.all, alt.Object.getByID, () => alt.Object.all.length);

mp.objects.new = (model, position, params) => {
    const obj = new alt.Object(model, position, params.rotation ?? alt.Vector3.zero, true, true);
    natives.freezeEntityPosition(obj, true);
    if ('alpha' in params) obj.alpha = params.alpha;
    // TODO: dimension

    return obj.mp;
}
