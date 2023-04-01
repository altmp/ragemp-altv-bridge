import * as alt from 'alt-client';
import mp from '../../shared/mp.js';

const verbosityLevels = {
    info: 0,
    warning: 1,
    error: 2,
    fatal: 3
}

class _Console {
    clear() {}
    reset() {}
    
    logInfo(msg) {
        if (this.#verbosityLevel > 0) return;
        alt.log(msg);
    }

    logWarning(msg) {
        if (this.#verbosityLevel > 1) return;
        alt.logWarning(msg);
    }

    logError(msg) {
        if (this.#verbosityLevel > 2) return;
        alt.logError(msg);
    }

    logFatal(msg) {
        if (this.#verbosityLevel > 3) return;
        alt.logError(msg);
    }

    #verbosity = 'info';
    #verbosityLevel = 0;

    get verbosity() {
        return this.#verbosity;
    }

    set verbosity(value) {
        if (!(value in verbosityLevels)) value = 'info';
        this.#verbosity = value;
        this.#verbosityLevel = verbosityLevels[value];
    }
}

mp.console = new _Console;