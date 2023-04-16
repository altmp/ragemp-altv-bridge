export class EntityBaseView {
    constructor() {
    }

    toArray() {
        return [];
    }

    toArrayInStreamRange() {
        return [];
    }

    getByID(id) {
        return null;
    }

    getByRemoteID(id) {
        return null;
    }

    getByScriptID(id) {
        return null;
    }

    has(id) {
        return false;
    }

    hasRemoteID(id) {
        return false;
    }

    hasScriptID(id) {
        return false;
    }

    getCount() {
        return 0;
    }
}
