import * as alt from 'alt-server';
import mp from 'shared/mp';
import './Player.js';
import './Vehicle.js';
import './Ped.js';
import './Colshape.js';
import './Checkpoint.js';
import './Blip.js';
import './Marker.js';
import {_Object} from './Object.js';
import './Dummy.js';
import {_Label} from './Label.js';
import {VirtualEntityID} from '../../shared/VirtualEntityID';

Object.defineProperty(alt.VirtualEntity.prototype, 'mp', {
    /** @this {alt.VirtualEntity} */
    get() {
        if (this._mp) return this._mp;
        const type = this.getStreamSyncedMeta(mp.prefix + 'type');
        switch (type) {
            case VirtualEntityID.Label:
                return this._mp = new _Label(this);
            case VirtualEntityID.Object:
                return this._mp = new _Object(this);
        }

        return null;
    }
});
