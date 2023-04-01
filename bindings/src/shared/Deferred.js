export class Deferred extends Promise {
    done = false;

    constructor() {
        super((resolve, reject) => {
            this.resolve = (value) => {
                if (this.done) return;
                this.done = true;
                resolve(value);
            };
            this.reject = (value) => {
                if (this.done) return;
                this.done = true;
                reject(value);
            };
        });
    }
}