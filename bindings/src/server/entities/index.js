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
import './Pickup.js';
import {_Label} from './Label.js';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {internalName} from '../../shared/utils';
import {_Marker} from './Marker';
import {_Checkpoint} from './Checkpoint';

Object.defineProperty(alt.VirtualEntity.prototype, 'mp', {
    /** @this {alt.VirtualEntity} */
    get() {
        if (this._mp) return this._mp;
        const type = this.getStreamSyncedMeta(internalName('type'));
        switch (type) {
            case VirtualEntityID.Label:
                return this._mp = new _Label(this);
            case VirtualEntityID.Object:
                return this._mp = new _Object(this);
            case VirtualEntityID.Marker:
                return this._mp = new _Marker(this);
            case VirtualEntityID.Checkpoint:
                return this._mp = new _Checkpoint(this);
        }

        return null;
    }
});
