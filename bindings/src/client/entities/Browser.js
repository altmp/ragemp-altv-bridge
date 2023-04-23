import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {ClientPool} from '../ClientPool.js';
import {_BaseObject} from './BaseObject.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';

function transformUrl(url) {
    if (url.startsWith('package://')) return 'http://resource/' + url.substring(10);
    if (url.startsWith('http://package/')) return 'http://resource/' + url.substring(15);
    return url;
}

export class _Browser extends _BaseObject {
    alt;

    /** @param {alt.WebView} _alt */
    constructor(_alt) {
        super();
        this.alt = _alt;
        this.#_url = _alt.url;

        this.alt.on(mp.prefix + 'event', (evt, ...args) => {
            mp.events.dispatch(evt, ...args);
        });

        this.alt.on('load', () => {
            mp.events.dispatch('browserDomReady', this);
        });

        this.alt.on(mp.prefix + 'ready', () => {
            this.alt.emit(mp.prefix + 'receiveEvents', alt.isCursorVisible());
        });

        if (mp._main) {
            this.alt.on(mp.prefix + 'chat', (arg) => {
                alt.emitServer(mp.prefix + 'onchat', arg);
                alt.emit(mp.prefix + 'onchat', arg);
            });
        }

        // TODO: browserLoadingFailed
    }

    type = 'browser';

    get id() {
        return this.alt.id;
    }

    call(event, ...args) {
        if (!this.alt.valid) return;
        this.alt.emit(mp.prefix + 'event', event, ...args);
    }

    // TODO: RPC (callProc, cancelPendingProc, hasPendingProc)

    execute(code) {
        if (!this.alt.valid) return;
        this.alt.emit(mp.prefix + 'eval', code);
    }

    executeCached(code) {
        this.execute(code);
    }

    destroy() {
        if (!this.alt.valid) return;
        this.alt.destroy();
    }

    markAsChat() {

    }
    // TODO: markAsChat ?

    #_url;
    #_urlWasChanged = false;

    get url() {
        if (!this.alt.valid) return '';
        return this.alt.url;
    }

    set url(value) {
        if (!this.alt.valid) return;
        value = transformUrl(value);
        this.#_url = value;
        this.alt.url = value;
        this.#_urlWasChanged = false;
    }

    reload() {
        if (!this.alt.valid) return;
        this.alt.url = 'data:text/html, ';
        setTimeout(() => {
            if (!this.#_urlWasChanged) this.alt.url = this.#_url;
        }, 500); // TODO: implement in core
    }

    get active() {
        if (!this.alt.valid) return false;
        return this.alt.isVisible;
    }

    set active(value) {
        if (!this.alt.valid) return;
        this.alt.isVisible = value;
    }
}

Object.defineProperty(alt.WebView.prototype, 'mp', {
    get() {
        return this._mp ??= new _Browser(this);
    }
});

mp.Browser = _Browser;

mp.browsers = new ClientPool(EntityGetterView.fromClass(alt.Blip));

mp.browsers.new = function (url) {
    const webview = new alt.WebView(transformUrl(url));
    return webview.mp;
};

alt.on('baseObjectCreate', (baseObject) => {
    if (baseObject instanceof alt.WebView) mp.events.dispatch('browserCreated', baseObject.mp);
});
