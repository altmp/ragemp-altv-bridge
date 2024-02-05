import * as alt from 'alt-server';
import mp from '../../shared/mp';
import { _Entity } from './Entity';
import { VirtualEntityID } from '../../shared/VirtualEntityID';
import { ServerPool } from '../pools/ServerPool';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {internalName} from '../../shared/utils';

const view = new EntityStoreView();

export class _Label extends _Entity {

    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        view.add(this, this.id);
        this.alt.setStreamSyncedMeta(internalName('drawDistance'), this.alt.streamingDistance);
    }

    type = 'textlabel';

    destroy() {
        if (!this.alt.valid) return;
        this.alt.destroy();
        view.remove(this.id);
    }

    get setVariable() {
        return this.setStreamVariable;
    }

    get getVariable() {
        return this.getStreamVariable;
    }

    get hasVariable() {
        return this.hasStreamVariable;
    }

    get drawDistance() {
        return this.alt.streamingDistance;
    }

    /** @deprecated */
    set drawDistance(value) {
        throw new Error('Streaming distance changes are not supported');
    }

    #color = alt.RGBA.white;
    get color() {
        return this.#color.toArray();
    }
    set color(value) {
        value = new alt.RGBA(value);
        this.#color = value;
        this.alt.setStreamSyncedMeta(internalName('color'), value);
    }

    #font;
    get font() {
        return this.#font;
    }
    set font(value) {
        this.#font = value;
        this.alt.setStreamSyncedMeta(internalName('font'), value);
    }

    #los = false;
    get los() {
        return this.#los;
    }
    set los(value) {
        this.#los = value;
        this.alt.setStreamSyncedMeta(internalName('los'), value);
    }

    #text = '';
    get text() {
        return this.#text;
    }
    set text(value) {
        this.#text = value;
        this.alt.setStreamSyncedMeta(internalName('text'), value);
    }
}

mp.TextLabel = _Label;

alt.on('baseObjectRemove', (ent) => {
    if (ent.mp instanceof _Label) view.remove(ent.mp.id);
});

mp.labels = new ServerPool(view, [_Label]);

const group = new alt.VirtualEntityGroup(40);
mp.labels.new = function(text, position, params = {}) {
    const virtualEnt = new alt.VirtualEntity(group, position, params.drawDistance ?? 30);
    virtualEnt.setStreamSyncedMeta(internalName('type'), VirtualEntityID.Label);
    const ent = virtualEnt.mp;
    ent.text = text;
    ent.los = params.los ?? false;
    ent.font = params.font ?? 4;
    ent.color = params.color ? new alt.RGBA(params.color) : alt.RGBA.white;
    ent.dimension = params.dimension ?? 0;

    return ent;
};
