import * as alt from 'alt-server';
import mp from '../../shared/mp';
import { _Entity } from './Entity';
import { Pool } from '../Pool';
import { VirtualEntityID } from '../../shared/VirtualEntityID';

const labels = new Set;

export class _Label extends _Entity {

    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        labels.add(this.alt);
        this.alt.setStreamSyncedMeta(mp.prefix + 'drawDistance', this.alt.streamingDistance);
        this.alt.setStreamSyncedMeta(mp.prefix + 'type', VirtualEntityID.Label);
    }

    get setVariable() {
        return this.setStreamVariable;
    }

    get getVariable() {
        return this.getStreamVariable;
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
        this.alt.setStreamSyncedMeta(mp.prefix + 'color', value);
    }
    
    #font;
    get font() {
        return this.#font;
    }
    set font(value) {
        this.#font = value;
        this.alt.setStreamSyncedMeta(mp.prefix + 'font', value);
    }

    #los = false;
    get los() {
        return this.#los;
    }
    set los(value) {
        this.#los = value;
        this.alt.setStreamSyncedMeta(mp.prefix + 'los', value);
    }

    #text = '';
    get text() {
        return this.#text;
    }
    set text(value) {
        this.#text = value;
        this.alt.setStreamSyncedMeta(mp.prefix + 'text', value);
    }
}

mp.Label = _Label;

alt.on('baseObjectRemove', (ent) => {
    if (ent.mp instanceof _Label) labels.delete(ent.mp);
});

mp.labels = new Pool(() => [...labels.values()], (id) => {
    const ent = alt.VirtualEntity.all.find(e => e.id == id); // TODO: getByID
    if (!ent || !(ent.mp instanceof _Label)) return null;
    return ent.mp;
}, () => labels.size());

const group = new alt.VirtualEntityGroup(40);
mp.labels.new = function(text, position, params) {
    const virtualEnt = new alt.VirtualEntity(group, position, params.drawDistance ?? 30);
    console.log('created ent');
    virtualEnt.setStreamSyncedMeta(mp.prefix + 'type', VirtualEntityID.Label);
    console.log('set meta');
    const ent = virtualEnt.mp;
    console.log('after mp conversion');
    ent.text = text;
    ent.los = params.los ?? false;
    ent.font = params.font ?? 4;
    ent.color = params.color ? new alt.RGBA(params.color) : alt.RGBA.white;
    ent.dimension = params.dimension ?? 0;
}