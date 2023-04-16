import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../../shared/mp.js';
import { ClientPool } from '../../ClientPool';
import { _Entity } from '../Entity';
import { LabelRenderer } from './LabelRenderer';
import { VirtualEntityID } from '../../../shared/VirtualEntityID';
import { _VirtualEntityBase } from '../VirtualEntityBase';
import {EntityStoreView} from '../../../shared/pools/EntityStoreView';

const view = new EntityStoreView(1, (e) => e.isStreamedIn);

export class _Label extends _VirtualEntityBase {
    #los;

    /** @param {alt.VirtualEntity} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
        this.renderer = new LabelRenderer(() => alt.pos);
        view.add(this, this.id, undefined, this.alt.remoteId);
        this.updateData();
    }

    updateData() {
        for (const key of (this.alt.isRemote ? this.alt.getStreamSyncedMetaKeys() : this.alt.getMetaDataKeys())) {
            this.update(key, this.alt.isRemote ? this.alt.getStreamSyncedMeta(key) : this.alt.getMeta(key));
        }
    }

    streamIn = () => {
        this.renderer.setActive(true);
        this.updateData();
    };

    streamOut = () => {
        this.renderer.setActive(false);
    };

    onDestroy = () => {
        this.renderer.setActive(false);
        view.remove(this.id);
    };

    update = (key, value) => {
        if (!key.startsWith(mp.prefix)) return;
        this.renderer[key.substr(mp.prefix.length)] = value;
    };

    remoteId() {
        return this.alt.remoteId;
    }

    getVariable(key) {
        if (this.isRemote) return this.alt.getStreamSyncedMeta(key); // TODO: convert result
        return this.alt.getMeta(key);
    }

    setVariable(key, value) {
        if (this.isRemote) return;
        this.alt.setMeta(key, value);
    }

    hasVariable(key) {
        if (this.isRemote) return this.alt.hasStreamSyncedMeta(key);
        return this.alt.hasMeta(key);
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
        return this.#los;
    }

    set los(value) {
        this.#los = value;
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

mp.Label = _Label;

mp.labels = new ClientPool(view);

const group = new alt.VirtualEntityGroup(40);

mp.labels.new = (text, position, params) => {
    const virtualEnt = new alt.VirtualEntity(group, position, params.drawDistance ?? 30);
    virtualEnt.setMeta(mp.prefix + 'type', VirtualEntityID.Label);
    const ent = virtualEnt.mp;
    ent.text = text;
    ent.los = params.los ?? false;
    ent.font = params.font ?? 4;
    ent.color = params.color ? new alt.RGBA(params.color) : alt.RGBA.white;
    ent.dimension = params.dimension ?? 0;

    return ent;
};
