import * as alt from 'alt-client';
import {prefix} from "./constants";
import {findFunction, getDataHash} from "./indexing";
import {TestContext} from "./types";
import * as natives from "natives";

function waitForEvent(event: string, timeout = 10000) {
    return new Promise<any[]>((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(`RPC await ${event} timed-out after ${timeout} ms`);
        }, timeout);
        alt.onceServer(event, (...args) => {
            clearTimeout(timer);
            resolve(args);
        });
    })
}

let playerIndex = 0;
export default function init() {
    alt.onServer(prefix + 'register', (hash, index) => {
        const localHash = getDataHash();
        if (localHash != hash) {
            alt.emitServer(prefix + 'registerStatus', false, `Test hash match failed. Local hash is ${localHash}, while expected is ${hash}`);
            return;
        }

        playerIndex = index;
        alt.emitServer(prefix + 'registerStatus', true);
        console.log(`Registered onto test with hash ${hash} as client #${index} successfully`);
    });

    alt.onServer(prefix + 'execute', async (functionIndex) => {
        const func = findFunction(functionIndex);
        console.log(`Executing function ${func.name}...`);

        if (!func) {
            const err = `Failed to find function with index ${functionIndex}`;
            console.log(err);
            alt.emitServer(prefix + 'executeStatus', -1, false, err);
        }

        let counter = 0;
        const context: TestContext = {
            server: async () => {
                const id = counter++;
                const [statusId, status] = await waitForEvent(prefix + 'executeStatus');
                if (statusId != -1 && statusId != id) throw new Error(`Execution step ID mismatch, expected ${id}, received ${statusId}`);
                if (!status) throw new Error('Server-side failure');
            },
            client: async (func, player) => {
                const id = counter++;

                if (player && player != playerIndex) {
                    const [statusId, status] = await waitForEvent(prefix + 'executeStatus');
                    if (statusId != -1 && statusId != id) throw new Error(`Execution step ID mismatch, expected ${id}, received ${statusId}`);
                    if (!status) throw new Error('Another client failure');
                }

                await func({ alt, natives, mp: (globalThis as any).mp } as any);
                alt.emitServer(prefix + 'executeStatus', id, true);
            },
            player: alt.Player.local
        }

        try {
            await func.func(context);
            alt.emitServer(prefix + 'executeStatus', -1, true);
        } catch(e: any) {
            console.log(e);
            alt.emitServer(prefix + 'executeStatus', -1, false, String(e?.stack ? e.stack : e));
        }

        console.log(`${func.name} execution finished`);
    })
}