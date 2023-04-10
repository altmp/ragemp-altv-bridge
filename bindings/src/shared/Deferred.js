export class Deferred {
    done = false;

    #resolve;
    #reject;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    resolve(value) {
        if (this.done) return;
        this.done = true;
        this.#resolve(value);
    }

    reject(value) {
        if (this.done) return;
        this.done = true;
        this.#reject(value);
    }
}
