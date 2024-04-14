import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {ClientPool} from '../pools/ClientPool.js';
import {_BaseObject} from './BaseObject.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {emitServerInternal} from '../clientUtils';
import {argsToMp, emitInternal} from '../../shared/utils';
import {BaseObjectType} from '../../shared/BaseObjectType';

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
            mp.events.dispatchLocal(evt, ...argsToMp(args));
        });

        this.alt.on('load', () => {
            mp.events.dispatchLocal('browserDomReady', this);
        });

        // this.alt.on(mp.prefix + 'ready', () => {
        //     this.alt.emit(mp.prefix + 'receiveEvents', alt.isCursorVisible());
        // });

        if (mp._main) {
            this.alt.on(mp.prefix + 'chat', (arg) => {
                emitServerInternal('onchat', arg);
                emitInternal('onchat', arg);
            });
        }

        // TODO: browserLoadingFailed
    }

    type = 'browser';

    get id() {
        if (!this.alt.valid) return -1;
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

    set headlessTextureDict(value) {
    }

    get headlessTextureDict() {
        return '';
    }

    set headlessTextureName(value) {
    }

    get headlessTextureName() {
        return '';
    }

    set headlessTextureHeightScale(value) {
    }

    get headlessTextureHeightScale() {
        return '';
    }

    set inputEnabled(value) {
    }

    get inputEnabled() {
        return '';
    }

    set mouseInputEnabled(value) {
    }

    get mouseInputEnabled() {
        return true;
    }

    sendMouseClickEvent(value) {
    }

    sendMouseMoveEvent(value) {
    }
}

Object.defineProperty(alt.WebView.prototype, 'mp', {
    get() {
        return this._mp ??= new _Browser(this);
    }
});

mp.Browser = _Browser;

mp.browsers = new ClientPool(EntityGetterView.fromClass(alt.WebView, [BaseObjectType.WebView]), [_Browser]);

mp.browsers.new = function (url) {
    const webview = new alt.WebView(transformUrl(url));
    webview.focus();
    return webview.mp;
};

// TODO: Possible to implement compatibility with 3D CEF?
mp.browsers.newHeadless = mp.browsers.new;

alt.on('baseObjectCreate', (baseObject) => {
    if (baseObject instanceof alt.WebView) mp.events.dispatchLocal('browserCreated', baseObject.mp);
});
