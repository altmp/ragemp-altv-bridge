import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import { Pool } from '../Pool.js';
import { _BaseObject } from './BaseObject.js';

const created = {};
let list = [];
let lastId = 0;

function transformUrl(url) {
    if (url.startsWith('package://')) return 'http://resource/' + url.substring(10);
    return url;
}

export class _Browser extends _BaseObject {
    #alt;
    id;

    /** @param {alt.WebView} alt */
    constructor(alt) {
        super(alt);
        this.#alt = alt;
        this.#_url = alt.url;
        this.id = lastId++;
        this.alt.id = this.id; // TODO: remove when implemented in core
        created[this.id] = this;
        list = Object.values(created);
    }

    get type() {
        return 'browser';
    }

    // TODO: RPC (call, cancelPendingProc, hasPendingProc)

    execute(code) {
        this.#alt.emit('$eval', code); // TODO: Implement in webview bridge
    }

    executeCached(code) {
        this.execute(code);
    }

    destroy() {
        this.#alt.destroy();
        delete created[this.id];
        list = Object.values(created);
    }

    // TODO: markAsChat ?

    #_url;
    #_urlWasChanged = false;
    
    get url() {
        return this.#alt.url;
    }

    set url(value) {
        value = transformUrl(value);
        this.#_url = value;
        this.#alt.url = value;
        this.#_urlWasChanged = false;
    }

    reload() {
        this.#alt.url = 'data:text/html, ';
        setTimeout(() => {
            if (!this.#_urlWasChanged) this.#alt.url = this.#_url;
        }, 500); // TODO: implement in core
    }

    get active() {
        return this.#alt.isVisible;
    }

    set active(value) {
        this.#alt.isVisible = value;
    }
}

Object.defineProperty(alt.WebView.prototype, 'mp', { 
    get() {
        return this._mp ??= new _Browser(this);
    } 
});

mp.Browser = _Browser;

mp.browsers = new Pool(() => list, () => list, (id) => created[id]);

mp.browsers.new = function(url) {
    const webview = new alt.WebView(transformUrl(url));
    return webview.mp;
}