import util from 'util';

export class _BaseObject {
    get isMpWrapper() {
        return true;
    }

    toString() {
        return `${this.constructor.name}<${this.id ?? -1}>`;
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}
