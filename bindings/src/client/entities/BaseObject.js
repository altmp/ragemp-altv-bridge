export class _BaseObject {
    get isMpWrapper() {
        return true;
    }

    toJSON() {
        return JSON.stringify(Object.fromEntries(Object.entries(this).filter(e => e[0] !== 'alt')))
    }
}
