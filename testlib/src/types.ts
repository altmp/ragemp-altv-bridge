/// <reference path="../@ragemp/types-server/index.d.ts" />
/// <reference path="../@ragemp/types-client/index.d.ts" />

export type TestServerCallback = (func: (ctx: ServerActionContext) => void) => Promise<void>;
export type TestClientCallback = (func: (ctx: ClientActionContext) => void, player?: number) => Promise<void>;

export interface TestContext {
    client: TestClientCallback,
    server: TestServerCallback,
    player: any
}

export interface ServerActionContext {
    alt: typeof import('alt-server');
    mp: (typeof import('mp-server'))['mp'];
}

export interface ClientActionContext {
    alt: typeof import('alt-client');
    natives: typeof import('natives');
    mp: (typeof import('mp-client'))['mp'];
}

export interface TestFunction {
    name: string,
    type: 'function',
    func: (ctx: TestContext) => any,
    index: number,
    parent?: TestGroup,
    requiredPlayers: number
}

export interface TestGroup {
    name: string | null,
    type: 'group',
    children: TestItem[];
    before?: TestFunction;
    after?: TestFunction;
    beforeEach?: TestFunction;
    afterEach?: TestFunction;
    clientActionContextProvider?: string;
    serverActionContextProvider?: string;
    parent?: TestGroup;
}

export interface TestError {
    path: string[];
    error: string;
    clientId: null | number; // null if server
}

export interface TestResults {
    errors: TestError[];
    passed: number;
    skipped: number;
    failed: number;
}

export type TestItem = TestFunction | TestGroup;