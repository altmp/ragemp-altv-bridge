import {EntityBaseView} from './EntityBaseView';
import {toMp} from '../utils';

export class EntityGetterView extends EntityBaseView {
    constructor(listGetter, idGetter, {remoteIDGetter, scriptIDGetter, countGetter, streamRangeGetter}) {
        super();
        this.listGetter = listGetter;
        if (!idGetter) console.trace('ID getter is not defined, polyfilling');
        this.idGetter = idGetter ?? ((id) => listGetter().find(e => e.id === id));
        this.remoteIDGetter = remoteIDGetter;
        this.scriptIDGetter = scriptIDGetter;
        this.streamRangeGetter = streamRangeGetter;
        this.countGetter = countGetter ?? (() => listGetter().length);
    }

    static fromClass(obj) {
        return new EntityGetterView(
            () => obj.all,
            obj.getByID,
            {
                remoteIDGetter: obj.getByRemoteID,
                scriptIDGetter: obj.getByScriptID,
                streamRangeGetter: () => obj.streamedIn,
                countGetter: () => obj.count
            }
        );
    }

    toArray() {
        return this.listGetter().map(toMp);
    }

    toArrayInStreamRange() {
        return this.streamRangeGetter?.().map(toMp) ?? [];
    }

    getByID(id) {
        return toMp(this.idGetter(id) ?? null);
    }

    getByRemoteID(id) {
        return toMp(this.remoteIDGetter?.(id) ?? null);
    }

    getByScriptID(id) {
        return toMp(this.scriptIDGetter?.(id) ?? null);
    }

    has(id) {
        return this.idGetter(id) != null;
    }

    hasRemoteID(id) {
        return this.remoteIDGetter?.(id) != null;
    }

    hasScriptID(id) {
        return this.scriptIDGetter?.(id) != null;
    }

    getCount() {
        return this.countGetter();
    }
}
