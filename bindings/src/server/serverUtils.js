import mp from '../shared/mp.js';
import alt from 'alt-server';
import {internalName} from '../shared/utils';

export const emitClient = mp._disableRawEmits ? alt.emitClient : alt.emitClientRaw;
export const emitClientUnreliable = mp._enableUnreliableEmits ? alt.emitClientUnreliable : emitClient;
export const emitAllClients = mp._disableRawEmits ? alt.emitAllClients : alt.emitAllClientsRaw;
export const emitAllClientsUnreliable = mp._enableUnreliableEmits ? alt.emitAllClientsUnreliable : emitAllClients;

// export const emitClient = (player, event, ...args) => {
//    if (mp._disableRawEmits) return alt.emitClient(player, event, ...args);
//    return alt.emitClientRaw(player, event, ...args);
//};

// export const emitClientUnreliable = (player, event, ...args) => {
//    if (mp._enableUnreliableEmits) return alt.emitClientUnreliable(player, event, ...args);
//    emitClient(player, event, ...args);
//};

// export const emitAllClients = (event, ...args) => {
//    if (mp._disableRawEmits) return alt.emitAllClients(event, ...args);
//    return alt.emitAllClientsRaw(event, ...args);
//};

// export const emitAllClientsUnreliable = (event, ...args) => {
//    if (mp._enableUnreliableEmits) return alt.emitAllClientsUnreliable(event, ...args);
//    return emitAllClients(event, ...args);
//};

export const emitClientInternal = (player, event, ...args) => {
    alt.emitClientRaw(player, internalName(event), ...args);
};

export const emitAllClientsInternal = (event, ...args) => {
    alt.emitAllClients(internalName(event), ...args);
};
