import {EntityBaseView} from './EntityBaseView';
import {toMp} from '../utils';
import alt from 'alt-shared';

export class EntityGetterView extends EntityBaseView {
    constructor(listGetter, idGetter, {remoteIDGetter, scriptIDGetter, countGetter, streamRangeGetter}, name = '') {
        super();
        this.listGetter = () => listGetter().filter(e => e != null);
        if (!idGetter) alt.logWarning(name, 'ID getter is not defined, polyfilling');
        this.idGetter = idGetter ?? ((id) => this.listGetter().find(e => e.id === id));
        if (!remoteIDGetter) alt.logWarning(name, 'Remote ID getter is not defined, polyfilling');
        this.remoteIDGetter = remoteIDGetter ?? (id => this.listGetter().find(e => e.remoteId == null ? (e.id === id) : (e.remoteId === id)));
        this.scriptIDGetter = (scriptID => this.listGetter().find(e => e.valid && e.scriptID === scriptID)); // TODO: use scriptIDGetter
        this.streamRangeGetter = streamRangeGetter;
        this.countGetter = countGetter ?? (() => this.listGetter().length);
    }

    static fromClass(obj) {
        return new EntityGetterView(
            () => obj.all,
            obj.getByID,
            {
                remoteIDGetter: obj.getByRemoteID,
                scriptIDGetter: (scriptID) => {
                    const ent = obj.getByScriptID(scriptID);
                    return (ent instanceof obj) ? ent : null;
                },
                streamRangeGetter: () => (obj.streamedIn ?? []),
                countGetter: () => obj.count
            },
            obj.name
        );
    }

    toArray() {
        return this.listGetter().map(toMp);
    }

    toArrayInStreamRange() {
        return this.streamRangeGetter?.().map(e => e.mp).filter(Boolean) ?? [];
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
