import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../../shared/mp.js';
import { Pool } from '../../Pool';
import { _Entity } from '../Entity';
import { LabelRenderer } from './LabelRenderer';
import { VirtualEntityID } from '../../../shared/VirtualEntityID';
import { _VirtualEntityBase } from '../VirtualEntityBase';

const labels = new Set;
let labelsArray = [];
let streamedLabelsArray = [];

function updateCache() {
    labelsArray = [...labels.values()];
    streamedLabelsArray = labelsArray.filter(e => e.renderer.active); // TODO: use some streamedIn property instead
}

class _Label extends _VirtualEntityBase {
    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        this.renderer = new LabelRenderer(() => alt.pos);
        for (const key of (alt.isRemote ? alt.getStreamSyncedMetaKeys() : alt.getMetaDataKeys())) {
            this.update(key, alt.isRemote ? alt.getStreamSyncedMeta(key) : alt.getMeta(key));
        }
        labels.add(this);
        updateCache();
    }

    streamIn = () => {
        this.renderer.setActive(true);
        updateCache();
    }

    streamOut = () => {
        this.renderer.setActive(false);
        updateCache();
    }

    onDestroy = () => {
        this.renderer.setActive(false);
        labels.delete(this);
        updateCache();
    }

    update = (key, value) => {
        if (!key.startsWith(mp.prefix)) return;
        this.renderer[key.substr(mp.prefix.length)] = value;
    }

    remoteId() {
        return this.alt.remoteId;
    }

    getVariable(key) {
        if (this.isRemote) return this.alt.getStreamSyncedMeta(key); // TODO: convert result
        else return this.alt.getMeta(key);
    }

    setVariable(key, value) {
        if (this.isRemote) return;
        else this.alt.setMeta(key, value);
    }

    get color() {
        return this.renderer.color.toArray();
    }

    set color(value) {
        this.renderer.color = new alt.RGBA(value);
    }

    get drawDistance() {
        return this.getVariable(mp.prefix + 'drawDistance');
    }

    set drawDistance(value) {
        if (this.alt.isRemote) return;
        this.setVariable(mp.prefix + 'drawDistance', value);
    }

    get font() {
        return this.renderer.font;
    }

    set font(value) {
        this.renderer.font = value;
    }

    get los() {
        return this.los;
    }

    set los(value) {
        this.los = value;
    }

    get text() {
        return this.renderer.text;
    }

    set text(value) {
        this.renderer.text = value;
    }

    destroy() {
        if (this.alt.isRemote) return;
        this.renderer.setActive(false);
        this.alt.destroy();
    }
}

// TODO: define on prototype globally for all virtual entities
alt.on('baseObjectCreate', (ent) => {
    if (!(ent instanceof alt.VirtualEntity)) return;
    const type = ent.isRemote ? ent.getStreamSyncedMeta('type') : ent.getMeta('type');
    if (type !== VirtualEntityID.Label) return;
    ent.mp = new _Label(ent);
});

mp.Label = _Label;

mp.labels = new Pool(() => labelsArray, () => streamedLabelsArray, (id) => {
    const ent = alt.VirtualEntity.all.find(e => e.id == id); // TODO: getByID
    if (!ent || !(ent.mp instanceof _Label)) return null;
    return ent.mp;
}, () => labels.size());

mp.labels.atRemoteId = function (id) {
    const ent = alt.VirtualEntity.all.find(e => e.remoteId == id); // TODO: getByID
    if (!ent || !(ent.mp instanceof _Label)) return null;
    return ent.mp;
}

mp.labels.new = (text, pos, params) => {
    // TODO
}