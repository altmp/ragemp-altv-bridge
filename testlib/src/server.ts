import * as alt from 'alt-server';
import chalk from "chalk";
import chalkTemplate from 'chalk-template';
import {findProperty, getDataHash, getFunctionPath, getRoot} from "./indexing";
import {prefix} from "./constants";
import {TestContext, TestFunction, TestGroup, TestItem, TestResults} from "./types";
import {ClientError, SkipError} from "./utils";
import {autoReconnect} from "./autoReconnect";
import {Player} from "alt-server";

function waitForEvent(player: alt.Player, event: string, timeout = 10000) {
    return new Promise<any[]>((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(`RPC await ${event} from ${player.name} [${player.id}] timed-out after ${timeout} ms`);
        }, timeout);
        alt.onceClient(event, (recvPlayer, ...args) => {
            if (recvPlayer != player) return;
            clearTimeout(timer);
            resolve(args);
        });
    })
}

async function executeFunction(func: TestFunction, players: alt.Player[], params: any) {
    const receivedStatuses: Record<number, [number, boolean, string][]> = {};

    alt.onClient(prefix + 'executeStatus', (player: alt.Player, id: number, status: boolean, reason: string) => {
        const index = players.indexOf(player);
        receivedStatuses[index] ??= [];
        receivedStatuses[index].push([id, status, reason]);
    });

    let counter = 0;
    const context: TestContext = {
        client: async (func, playerId) => {
            const id = counter++;
            const player = players[playerId ?? 0];
            const [statusId, status, reason] =
            receivedStatuses[playerId ?? 0]?.find((e): boolean => e[0] == -1 || e[0] == id)
            ?? await waitForEvent(player, prefix + 'executeStatus');
            if (statusId != -1 && statusId != id) throw new ClientError(`Execution step ID mismatch, expected ${id}, received ${statusId}`, playerId ?? 0);
            if (!status) {
                if (reason.startsWith('$SKIP$')) throw new SkipError(reason.substring(6));
                throw new ClientError(reason, playerId ?? 0);
            }
        },
        server: async (func) => {
            const id = counter++;
            try {
                await func({ alt, mp: (globalThis as any).mp } as any);
                alt.emitClient(players, prefix + 'executeStatus', id, true);
            } catch(e) {
                alt.emitClient(players, prefix + 'executeStatus', id, false, String(e));
                throw e;
            }
        },
        player: (players[0] as any).mp,
        params
    }

    alt.emitClient(players, prefix + 'execute', func.index, params);

    async function waitForAllClients(doThrow = true) {
        await Promise.all(
            players
                .map(async player => {
                    while(true) {
                        const index = players.indexOf(player);
                        const [statusId, status, reason] =
                        receivedStatuses[index]?.find((e): boolean => e[0] == -1)
                        ?? await waitForEvent(player, prefix + 'executeStatus');
                        if (statusId != -1) continue;
                        if (!status && doThrow) {
                            if (reason.startsWith('$SKIP$')) throw new SkipError(reason.substring(6));
                            throw new ClientError(reason, index);
                        }
                        break;
                    }
                })
        )
    }
    try {
        await func.func(context);
        await waitForAllClients();
    } catch(e) {
        alt.emitClient(players, prefix + 'executeStatus', -1, false, String(e));
        await waitForAllClients(false);
        throw e;
    }
}

async function execute(func: TestFunction, players: alt.Player[], results: TestResults, indentLevel = 0, skipAutoTasks = false) {
    const indent = '  '.repeat(indentLevel);
    if (players.length < func.requiredPlayers) {
        results.skipped++;
        return console.log(chalkTemplate`${indent}{gray ○ ${func.name} (not enough players)}`);
    }

    let reported = false;
    const functions: TestFunction[] = [];

    const before = findProperty('beforeEach', func);
    if (before && !skipAutoTasks) functions.push(before);
    functions.push(func);
    const after = findProperty('afterEach', func);
    if (after && !skipAutoTasks) functions.push(after);

    const params = func.params ?? {};

    for (let currentFunction of functions) {
        try {
            await executeFunction(currentFunction, players, params);
        } catch(e: any) {
            if (e instanceof SkipError) {
                results.skipped++;
                return console.log(chalkTemplate`${indent}{gray ○ ${func.name} (${e.message})}`);
            }
            results.errors.push({
                path: getFunctionPath(func),
                error: e instanceof ClientError ? e.message : String(e?.stack ? e.stack : e),
                clientId: e instanceof ClientError ? e.clientId : null
            });
            if (!reported) {
                reported = true;
                results.failed++;
                console.log(chalkTemplate`${indent}{redBright ✗} {gray ${func.name}}`);
            }
        }
    }

    if (!reported) {
        results.passed++;
        console.log(chalkTemplate`${indent}{greenBright ✓} {gray ${func.name}}`);
    }
}

async function run(item: TestItem, players: alt.Player[], results: TestResults, indentLevel = 0) {
    if (item.type === 'function') {
        await execute(item, players, results, indentLevel);
        return;
    }

    let nextIndent = indentLevel + 1;
    if (item.name == null) nextIndent = indentLevel;

    const indent = '  '.repeat(indentLevel);
    if (item.name != null) console.log(chalkTemplate`${indent}{bold ${item.name}}`);

    if (item.children.length && item.before) {
        await execute(item.before, players, results, nextIndent, true);
    }
    for (let child of item.children) {
        await run(child, players, results, nextIndent);
    }
    if (item.children.length && item.after) {
        await execute(item.after, players, results, nextIndent, true);
    }
}

async function start(category?: string) {
    data = {};
    const hash = getDataHash();

    console.log(chalkTemplate`Initializing test with hash {white.bold ${hash}}...`);
    const players: alt.Player[] = [];

    for (let player of alt.Player.all) {
        const index = players.length;
        try {
            player.emit(prefix + 'register', hash, index);
            const [status, reason] = await waitForEvent(player, prefix + 'registerStatus');
            if (!status) throw reason;
        } catch(e) {
            console.log(chalk.redBright(chalkTemplate`Failed to register player {bold ${player.name} [${player.id}]}: ${String(e)}`));
            return;
        }

        players.push(player);
        console.log(chalk.greenBright(chalkTemplate`Registered player {bold ${player.name} [${player.id}]} as client {bold #${index}} successfully`));
    }


    alt.on(prefix + 'executeStatus', (recvPlayer, id, status, reason) => {
        for (let player of players) {
            if (player != recvPlayer) player.emit('executeStepStatus', id, status, reason);
        }
    });

    const results: TestResults = {
        passed: 0,
        failed: 0,
        skipped: 0,
        errors: []
    }

    console.log();

    let root = getRoot();
    if (category) root = root.children.find(e => e.type === 'group' && e.name?.toLowerCase() == category.toLowerCase()) as TestGroup ?? root;
    await run(root, players, results);

    console.log();

    if (results.errors.length) {
        for (let error of results.errors) {
            console.log(chalkTemplate`{redBright.bold ● ${error.path.join(' › ')}} {yellowBright.bold ${error.clientId == null ? 'SERVER' : `CLIENT #${error.clientId}`}}\n`);
            console.log('  ' + error.error.replaceAll('\n', '\n  '));
            console.log();
        }
    }

    if (results.errors.length) {
        console.log(chalkTemplate`{bgRed.white.bold  FAIL }`);
    } else if (results.passed == 0) {
        console.log(chalkTemplate`{bgGray.white.bold  SKIP }`);
    } else {
        console.log(chalkTemplate`{bgGreen.white.bold  PASS }`);
    }
    console.log(chalkTemplate`{redBright.bold ${results.failed} failed}, {greenBright.bold ${results.passed} passed}, {gray.bold ${results.skipped} skipped}, ${results.passed + results.failed + results.skipped} total`);
}

let data: Record<string, any> = {};
export function setSyncedData(key: string, value: any) {
    data[key] = value;
    alt.emitClient(alt.Player.all as Player[], prefix + 'syncData', key, value);
}

export function getSyncedData(key: string): any {
    return data[key];
}

export function hasSyncedData(key: string): boolean {
    return key in data;
}

export const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
export default async function init() {
    alt.on('consoleCommand', (cmd, ...args) => {
        if (cmd == 'startTest') {
            start(args[0]);
        } else if (cmd == 'eval') {
            (async () => {
                console.log(await new AsyncFunction('alt', 'mp', args.join(' '))(alt, (globalThis as any).mp));
            })();
        }
    });

    alt.on('playerConnect', (player) => {
        console.log(chalk.blueBright(chalkTemplate`Player {white.bold ${player.name} [${player.id}]} connected`));
    });

    alt.onClient(prefix + 'syncData', (sender, key, value) => {
        data[key] = value;
        alt.emitClient(alt.Player.all as Player[], prefix + 'syncData', key, value);
    });

    alt.nextTick(() => {
        autoReconnect();
    });
}