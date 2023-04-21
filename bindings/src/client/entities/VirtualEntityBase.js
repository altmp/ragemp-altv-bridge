import * as alt from 'alt-client';
import { _Entity } from './Entity';
import mp from '../../shared/mp';
import {toMp} from '../../shared/utils';

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
        if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.streamIn();
        mp.events.dispatch('entityStreamIn', toMp(ent));
    });

    alt.on('worldObjectStreamOut', (ent) => {
        if (ent instanceof alt.VirtualEntity && ent.mp) ent.mp.streamOut();
        mp.events.dispatch('entityStreamOut', toMp(ent));
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
};
