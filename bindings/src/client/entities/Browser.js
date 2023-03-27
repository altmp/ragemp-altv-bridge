import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

const created = {};
let list = [];
let lastId = 0;

function transformUrl(url) {
    if (url.startsWith('package://')) return 'http://resource/' + url.substring(10);
    return url;
}

export class _Browser {
    #alt;
    id;

    /** @param {alt.WebView} alt */
    constructor(alt) {
        this.#alt = alt;
        this.#_url = alt.url;
        this.id = lastId++;
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

mp.browsers = {};

Object.defineProperties(mp.browsers, 'length', {
    get() {
        return list.length;
    }
});

// TODO size

mp.browsers.new = function(url) {
    const webview = new alt.WebView(transformUrl(url));
    return webview.mp;
}

mp.browsers.toArray = function() {
    return list;
}

mp.browsers.forEach = function(fn) {
    list.forEach(browser => fn(browser, browser.id));
}

mp.browsers.apply = mp.browsers.forEach;

mp.browsers.exists = function(id) {
    return id in created;
}

mp.browsers.at = function(id) {
    return created[id] ?? null;
}

mp.browsers.atRemoteId = function(id) {
    return mp.browsers.at(id);
}