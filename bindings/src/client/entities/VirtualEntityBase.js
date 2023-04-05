import * as alt from 'alt-client';
import { _Entity } from './Entity';

export class _VirtualEntityBase extends _Entity {
    streamIn() {}
    streamOut() {}
    onDestroy() {}
    update() {}
}


alt.on('worldObjectStreamIn', (ent) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.streamIn(); 
});

alt.on('worldObjectStreamOut', (ent) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.streamOut(); 
});

alt.on('baseObjectRemove', (ent) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.onDestroy(); 
});

alt.on('streamSyncedMetaChange', (ent, key, value) => {
    if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.update(key, value); 
})

Object.defineProperty(alt.VirtualEntity.prototype, 'isRemote', { get: () => true }); // TODO: remove when implemented in core