import * as alt from 'alt-client';
import { _Entity } from './Entity';
import mp from '../../shared/mp';
import {internalName, toMp} from '../../shared/utils';
import {VirtualEntityID} from '../../shared/VirtualEntityID';

export class _VirtualEntityBase extends _Entity {
    streamIn() {}
    streamOut() {}
    posChange() {}
    onDestroy() {}
    onCreate() {}
    update() {}
}

mp._initEventHandlers = () => {
    alt.on('worldObjectStreamIn', (ent) => {
        if (ent.type === alt.BaseObjectType.VirtualEntity && ent.mp) ent.mp.streamIn();
        if (ent.type === alt.BaseObjectType.LocalPed) return; // handled in Ped.js
        if (ent.type === alt.BaseObjectType.VirtualEntity && ent.getStreamSyncedMeta(internalName('type')) === VirtualEntityID.Object) return; // handled in Object.js
        mp.events.dispatchLocal('entityStreamIn', toMp(ent));
    });

    alt.on('worldObjectStreamOut', (ent) => {
        if (ent.type === alt.BaseObjectType.VirtualEntity && ent.mp) ent.mp.streamOut();
        mp.events.dispatchLocal('entityStreamOut', toMp(ent));
    });

    alt.on('worldObjectPositionChange', (ent, oldPos) => {
        if (ent.type === alt.BaseObjectType.VirtualEntity && ent.mp) ent.mp.posChange(oldPos);
    });

    alt.on('baseObjectCreate', (ent) => {
        if (ent.type === alt.BaseObjectType.VirtualEntity && ent.mp) ent.mp.onCreate();
    });

    alt.on('baseObjectRemove', (ent) => {
        if (ent.type === alt.BaseObjectType.VirtualEntity && ent.mp) ent.mp.onDestroy();
    });

    alt.on('streamSyncedMetaChange', (ent, key, value) => {
        if (ent.type === alt.BaseObjectType.VirtualEntity && ent.mp) ent.mp.update(key, value);
    });
};
