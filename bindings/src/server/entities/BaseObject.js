import alt from 'alt-server';

export class _BaseObject {
    get isMpWrapper() {
        return true;
    }

    toJSON() {
        return JSON.stringify(Object.fromEntries(Object.entries(this).filter(e => e[0] !== 'alt')));
    }

    toString() {
        return `${this.constructor.name}<${this.id ?? -1}>`;
    }

    [alt.Utils.inspect.custom]() {
        return this.toString();
    }
}
