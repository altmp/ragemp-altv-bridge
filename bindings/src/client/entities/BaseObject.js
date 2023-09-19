import alt from 'alt-client';

export class _BaseObject {
    get isMpWrapper() {
        return true;
    }

    toJSON() {
        return JSON.stringify(Object.fromEntries(Object.entries(this).filter(e => e[0] !== 'alt')));
    }

    forceStreamingUpdate() {

    }

    toString() {
        return `${this.constructor.name}<${this.id ?? -1}, ${this.remoteID ?? -1}>`;
    }

    [alt.Utils.inspect.custom]() {
        return this.toString();
    }
}
