import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {Pool} from '../Pool.js';
import {_BaseObject} from './BaseObject.js';

function transformUrl(url) {
    if (url.startsWith('package://')) return 'http://resource/' + url.substring(10);
    if (url.startsWith('http://package/')) return 'http://resource/' + url.substring(15);
    return url;
}

export class _Browser extends _BaseObject {
    alt;

    /** @param {alt.WebView} alt */
    constructor(alt) {
        super();
        this.alt = alt;
        this.#_url = alt.url;

        this.alt.on(mp.prefix + 'event', (evt, ...args) => {
            mp.events.dispatch(evt, ...args);
        });

        this.alt.on(mp.prefix + 'loaded', () => {
            mp.events.dispatch('browserDomReady', this);
        });

        // TODO: browserLoadingFailed
    }

    get type() {
        return 'browser';
    }

    get id() {
        return this.alt.id;
    }

    call(event, ...args) {
        this.alt.emit(mp.prefix + 'event', event, ...args);
    }

    // TODO: RPC (call, cancelPendingProc, hasPendingProc)

    execute(code) {
        this.alt.emit(mp.prefix + 'eval', code); // TODO: Implement in webview bridge
    }

    executeCached(code) {
        this.execute(code);
    }

    destroy() {
        this.alt.destroy();
    }

    // TODO: markAsChat ?

    #_url;
    #_urlWasChanged = false;

    get url() {
        return this.alt.url;
    }

    set url(value) {
        value = transformUrl(value);
        this.#_url = value;
        this.alt.url = value;
        this.#_urlWasChanged = false;
    }

    reload() {
        this.alt.url = 'data:text/html, ';
        setTimeout(() => {
            if (!this.#_urlWasChanged) this.alt.url = this.#_url;
        }, 500); // TODO: implement in core
    }

    get active() {
        return this.alt.isVisible;
    }

    set active(value) {
        this.alt.isVisible = value;
    }
}

Object.defineProperty(alt.WebView.prototype, 'mp', {
    get() {
        return this._mp ??= new _Browser(this);
    }
});

mp.Browser = _Browser;

mp.browsers = new Pool(() => alt.WebView.all, () => alt.WebView.all, (id) => alt.WebView.all.find(e => e.id == id)); // TODO: getByID

mp.browsers.new = function (url) {
    const webview = new alt.WebView(transformUrl(url));
    return webview.mp;
};

alt.on('baseObjectCreate', (baseObject) => {
    if (baseObject instanceof alt.WebView) mp.events.dispatch('browserCreated', baseObject.mp);
});
