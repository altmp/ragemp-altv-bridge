import alt from 'alt-server';

export class _BaseObject {
    get isMpWrapper() {
        return true;
    }

    toString() {
        return `${this.constructor.name}<${this.id ?? -1}>`;
    }

    [alt.Utils.inspect.custom]() {
        return this.toString();
    }
}
