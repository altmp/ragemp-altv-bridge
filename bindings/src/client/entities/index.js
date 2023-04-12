import * as alt from 'alt-client';
import './Player.js';
import './Vehicle.js';
import './Checkpoint.js';
import './Blip.js';
import './Marker.js';
import './Browser.js';
import './Camera.js';
import { _Label } from './label/Label.js';
import { VirtualEntityID } from '../../shared/VirtualEntityID';

Object.defineProperty(alt.VirtualEntity.prototype, 'mp', { get() {
    if (this._mp) return this._mp;
    const type = this.isRemote ? this.getStreamSyncedMeta(mp.prefix + 'type') : this.getMeta(mp.prefix + 'type');
    switch (type) {
        case VirtualEntityID.Label: return this._mp = new _Label(this);
    }

    return null;
} });