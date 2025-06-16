import * as alt from 'alt-client';
import mp from 'shared/mp';
import './Player.js';
import './Vehicle.js';
import './Checkpoint.js';
import './Blip.js';
import './Marker.js';
import './Browser.js';
import './Camera.js';
import './Colshape.js';
import './Pickup.js';
import {_Label} from './label/Label.js';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import './Ped';
import {_Obect} from './Object';
import {_NetworkMarker} from './Marker';
import {_NetworkCheckpoint} from './Checkpoint';

Object.defineProperty(alt.VirtualEntity.prototype, 'mp', {
    /** @this {alt.VirtualEntity} */
    get() {
        if (this._mp) return this._mp;
        const type = this.isRemote ? this.getStreamSyncedMeta(mp.prefix + 'type') : this.getMeta(mp.prefix + 'type');
        switch (type) {
            case VirtualEntityID.Label:
                return this._mp = new _Label(this);
            case VirtualEntityID.Object:
                return this._mp = new _Obect(this);
            case VirtualEntityID.Marker:
                return this._mp = new _NetworkMarker(this);
            case VirtualEntityID.Checkpoint:
                return this._mp = new _NetworkCheckpoint(this);
        }

        return null;
    }
});
