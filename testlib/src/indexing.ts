import {TestContext, TestFunction, TestGroup, TestItem} from "./types";
import * as crc from 'crc-32';
import {defineName} from "./utils";

const root: TestGroup = {
    name: null,
    type: 'group',
    children: []
}
let current = root;
let lastIndex = 0;

const testFunctions: Record<number, TestFunction> = {};

export function describe(name: string, func: () => void) {
    const previous = current;
    const group: TestGroup = {
        name,
        type: 'group',
        children: []
    };
    previous.children.push(group);
    current = group;
    func();
    if (current != group) throw new Error('Invalid test structure');
    current = previous;
}

export function it(name: string, func: (ctx: TestContext) => any, requiredPlayers = 1, params: any = undefined) {
    const item: TestFunction = {
        name,
        type: 'function',
        func: defineName(func, name),
        index: lastIndex++,
        parent: current,
        params,
        requiredPlayers
    };
    current.children.push(item);
    testFunctions[item.index] = item;
}

export function beforeEach(func: (ctx: TestContext) => any) {
    const item: TestFunction = {
        name: 'before each',
        type: 'function',
        func: defineName(func, 'before each'),
        index: lastIndex++,
        parent: current,
        requiredPlayers: 0
    };
    current.beforeEach = item;
    testFunctions[item.index] = item;
}

export function afterEach(func: (ctx: TestContext) => any) {
    const item: TestFunction = {
        name: 'after each',
        type: 'function',
        func: defineName(func, 'after each'),
        index: lastIndex++,
        parent: current,
        requiredPlayers: 0
    };
    current.afterEach = item;
    testFunctions[item.index] = item;
}

export function beforeAll(func: (ctx: TestContext) => any, requiredPlayers = 0) {
    const item: TestFunction = {
        name: 'before all',
        type: 'function',
        func: defineName(func, 'before all'),
        index: lastIndex++,
        parent: current,
        requiredPlayers
    };
    current.before = item;
    testFunctions[item.index] = item;
}

export function afterAll(func: (ctx: TestContext) => any, requiredPlayers = 0) {
    Object.defineProperty(func, 'name', { get: () => 'after all' });
    const item: TestFunction = {
        name: 'after all',
        type: 'function',
        func: defineName(func, 'after all'),
        index: lastIndex++,
        parent: current,
        requiredPlayers
    };
    current.after = item;
    testFunctions[item.index] = item;
}

export function setClientActionContextProvider(name: string) {
    current.clientActionContextProvider = name;
}

export function setServerActionContextProvider(name: string) {
    current.serverActionContextProvider = name;
}

export function findProperty<T extends keyof TestGroup>(key: T, item?: TestItem): TestGroup[T] | null {
    if (item == null) return null;
    if (item.type == 'function') return findProperty(key, item.parent);
    if (item[key]) return item[key];
    return findProperty(key, item.parent);
}

export function findFunction(index: number) {
    return testFunctions[index];
}

export function getDataHash() {
    return (crc.str(JSON.stringify(root, (key, value) => {
        if (key === 'parent') return undefined;
        return value;
    })) >>> 0).toString(16);
}

export function getRoot() {
    return root;
}

export function getFunctionPath(func?: TestItem) {
    const path = [];
    while (func) {
        if (func.name) path.push(func.name);
        func = func.parent;
    }

    return path.reverse();
}