import * as chai from 'chai';
import {isServer} from "./platforms";
import { waitFor } from "./utils";

chai.should();

let _setSyncedData: (key: string, value: any) => void | Promise<void> = async () => {
    throw new Error("Test library was not initialized yet.");
}

let _getSyncedData: (key: string) => any = () => {
    throw new Error("Test library was not initialized yet.");
}
let _hasSyncedData: (key: string) => boolean = () => {
    throw new Error("Test library was not initialized yet.");
}

export async function init() {
    if (isServer()) {
        const server = await import('./server');
        _setSyncedData = server.setSyncedData;
        _getSyncedData = server.getSyncedData;
        _hasSyncedData = server.hasSyncedData;
        await server.default();
    } else {
        const client = await import('./client');
        _setSyncedData = client.setSyncedData;
        _getSyncedData = client.getSyncedData;
        _hasSyncedData = client.hasSyncedData;
        await client.default();
    }
}

export async function setSyncedData(key: string, value: any) {
    return _setSyncedData(key, value);
}

export function getSyncedData(key: string) {
    return _getSyncedData(key);
}

export function hasSyncedData(key: string) {
    return _hasSyncedData(key);
}

export async function waitForSyncedData(key: string): Promise<any> {
    await waitFor(() => hasSyncedData(key));
    return getSyncedData(key);
}

export * from './types';
export { describe, it, beforeEach, afterEach, beforeAll, afterAll } from './indexing';
export { wait, waitFor, tryFor, SkipError } from './utils';
export { chai };