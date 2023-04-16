import * as alt from 'alt-client';
import { _Entity } from './Entity';
import mp from '../../shared/mp';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {_Label} from './label/Label';

export class _VirtualEntityBase extends _Entity {
    streamIn() {}
    streamOut() {}
    posChange() {}
    onDestroy() {}
    onCreate() {}
    update() {}
}


alt.on('worldObjectStreamIn', (ent) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.streamIn();
});

alt.on('worldObjectStreamOut', (ent) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.streamOut();
});

alt.on('worldObjectPositionChange', (ent, oldPos) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.posChange(oldPos);
});

alt.on('baseObjectCreate', (ent) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.onCreate();
});

alt.on('baseObjectRemove', (ent) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.onDestroy();
});

alt.on('streamSyncedMetaChange', (ent, key, value) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.update(key, value);
});
