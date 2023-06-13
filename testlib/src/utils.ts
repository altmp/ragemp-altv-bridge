export async function wait(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function waitFor(func: () => boolean, timeout = 2000, interval = 0): Promise<void> {
    const start = Date.now();
    while(true) {
        if (func()) return;
        if (Date.now() - start > timeout) throw new Error(`Failed to wait for ${func} after ${timeout} ms`);
        await wait(interval);
    }
}

export async function tryFor(func: () => void, timeout = 2000, interval = 10): Promise<void> {
    const start = Date.now();
    while(true) {
        if (Date.now() - start <= timeout) {
            try {
                func();
                return;
            } catch (e) {}
        } else {
            func();
            return;
        }
        await wait(interval);
    }
}

export class ClientError extends Error {
    constructor(message: string, public readonly clientId: number) {
        super(message || "No message provided");
    }
}

export class SkipError extends Error {
}

export function defineName<T>(value: T, name: string): T {
    Object.defineProperty(value, 'name', { get: () => name });
    return value;
}