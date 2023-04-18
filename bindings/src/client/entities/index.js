import * as alt from 'alt-client';
import mp from 'shared/mp';
import './Player.js';
import {_LocalVehicle} from './Vehicle.js';
import './Checkpoint.js';
import './Blip.js';
import './Marker.js';
import './Browser.js';
import './Camera.js';
import './Object.js';
import './Colshape.js';
import './Ped.js';
import {_Label} from './label/Label.js';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {_LocalPed} from './Ped';

Object.defineProperty(alt.VirtualEntity.prototype, 'mp', {
    /** @this {alt.VirtualEntity} */
    get() {
        if (this._mp) return this._mp;
        const type = this.isRemote ? this.getStreamSyncedMeta(mp.prefix + 'type') : this.getMeta(mp.prefix + 'type');
        switch (type) {
            case VirtualEntityID.Label:
                return this._mp = new _Label(this);
            case VirtualEntityID.LocalVehicle:
                return this._mp = new _LocalVehicle(this);
            case VirtualEntityID.Ped:
                return this._mp = new _LocalPed(this);
        }

        return null;
    }
});
