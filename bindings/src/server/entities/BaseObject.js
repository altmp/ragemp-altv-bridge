import alt from 'alt-server';

export class _BaseObject {
    get isMpWrapper() {
        return true;
    }

    toJSON() {
        return JSON.stringify(Object.fromEntries(Object.entries(this).filter(e => e[0] !== 'alt')));
    }

    toString() {
        if (!this.valid)
            return `${this.constructor.name}<destroyed>`;
        return `${this.constructor.name}<${this.id ?? -1}>`;
    }

    [alt.Utils.inspect.custom]() {
        return this.toString();
    }

    #forceInvalid = false;

    get valid() {
        if (this.#forceInvalid) return false;
        return this.alt.valid;
    }

    _markDestroyed() {
        this.#forceInvalid = true;
    }

    destroy() {
        if (!this.valid) return;
        this._markDestroyed();
        this.alt.destroy();
    }
}
