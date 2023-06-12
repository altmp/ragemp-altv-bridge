/// <reference path="./global.d.ts" />

import * as chai from 'chai';
import {isServer} from "./platforms";

chai.should();

export async function init() {
    if (isServer()) {
        const server = await import('./server');
        await server.default();
    } else {
        const client = await import('./client');
        await client.default();
    }
}

export * from './types';
export { describe, it, beforeEach, afterEach, beforeAll, afterAll } from './indexing';
export { wait, waitFor, tryFor } from './utils';