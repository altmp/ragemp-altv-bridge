import {EntityBaseView} from './EntityBaseView';
import {toMp} from '../utils';
import alt from 'alt-shared';

export class EntityGetterView extends EntityBaseView {
    #entities = new Set;
    #entityArrayCache = [];
    #types = new Set;

    constructor(listGetter, idGetter, {remoteIDGetter, scriptIDGetter, countGetter, streamRangeGetter}, types, name = '') {
        super();
        this.listGetter = () => listGetter().filter(e => e != null);
        if (!idGetter) alt.logWarning(name, 'ID getter is not defined, polyfilling');
        this.idGetter = idGetter ?? ((id) => this.listGetter().find(e => e.id === id));
        if (!remoteIDGetter) alt.logWarning(name, 'Remote ID getter is not defined, polyfilling');
        this.remoteIDGetter = remoteIDGetter ?? (id => this.listGetter().find(e => e.remoteID == null ? (e.id === id) : (e.remoteID === id)));
        this.scriptIDGetter = (scriptID => this.listGetter().find(e => e.valid && (e.scriptID === scriptID || e.gameID === scriptID))); // TODO: use scriptIDGetter
        this.streamRangeGetter = streamRangeGetter;
        this.countGetter = countGetter ?? (() => this.listGetter().length);
        this.#types = new Set(types);

        const entities = this.listGetter();
        for (const entity of entities) {
            if (!entity.mp) continue;
            this.#entities.add(entity.mp);
        }
        this.#updateEntityCache();

        alt.on('baseObjectCreate', (baseObject) => {
            if (!baseObject) return;
            if (!this.#types.has(baseObject.type)) return;

            const mpObject = baseObject.mp;
            if (!mpObject) return;
            this.#entities.add(mpObject);
            this.#updateEntityCache();
        });

        alt.on('baseObjectRemove', (baseObject) => {
            if (!baseObject) return;
            if (!this.#types.has(baseObject.type)) return;

            const mpObject = baseObject.mp;
            if (!mpObject) return;
            this.#entities.delete(mpObject);
            this.#updateEntityCache();
        });
    }

    #updateEntityCache() {
        this.#entityArrayCache = Array.from(this.#entities); // TODO: maybe Object.freeze?
    }

    static fromClass(obj, type) {
        if (type == null) throw new Error('Type required');
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
            type,
            obj.name
        );
    }

    toArray() {
        return this.#entityArrayCache;
    }

    #arrayStreamCacheAlt;
    #arrayStreamCacheMp;
    toArrayInStreamRange() {
        const list = this.streamRangeGetter?.() ?? [];
        if (this.#arrayStreamCacheAlt === list) return this.#arrayStreamCacheMp;
        this.#arrayStreamCacheAlt = list;
        this.#arrayStreamCacheMp = list.map(e => e.mp).filter(Boolean);
        return this.#arrayStreamCacheMp;
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
        return this.#entityArrayCache.length;
    }
}
