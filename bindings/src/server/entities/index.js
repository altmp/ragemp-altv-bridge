import * as alt from 'alt-server';
import './Player.js';
import './Vehicle.js';
import './Ped.js';
import './Colshape.js';
import { _Label } from  './Label.js';
import { VirtualEntityID } from '../../shared/VirtualEntityID';

Object.defineProperty(alt.VirtualEntity.prototype, 'mp', { get() {
    if (this._mp) return this._mp;
    const type = this.getStreamSyncedMeta(mp.prefix + 'type');
    switch (type) {
        case VirtualEntityID.Label: return this._mp = new _Label(this);
    }

    return null;
} });
