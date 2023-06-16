import * as alt from 'alt-shared';
import {prefix} from "../constants";
import {waitFor} from "../utils";

// const altServer = alt as unknown as typeof import('alt-server');
// const altClient = alt as unknown as typeof import('alt-client');

export function isServer() {
    return alt.isServer;
}

// let data = {};
// export async function setSyncData(key: string, value: any) {
//     if (isServer()) {
//         altServer.setSyncedMeta(prefix + 'data' + key, value);
//     } else {
//         altClient.emitServer(prefix + 'syncData', key, value);
//         await waitFor(() => getSyncData(key) == value);
//     }
// }
//
// export function getSyncData(key: string) {
//     return alt.getSyncedMeta(prefix + 'data' + key);
// }
//
// if (isServer()) {
//     altServer.onClient(prefix + 'syncData', (player, key, value) => {
//         setSyncData(key, value);
//     })
// }