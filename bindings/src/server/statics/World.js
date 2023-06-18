import mp from '../../shared/mp.js';
import * as alt from 'alt-server';

//Todo apply on player join and send to players on change

class _Time {
    #hour;
    #minute;
    #second;

    constructor() {
        this.#hour = 0;
        this.#minute = 0;
        this.#second = 0;
    }

    get hour() {
        return this.#hour;
    }

    set hour(value) {
        if(value < 0 || value > 23) return;
        this.#hour = value;
    }

    get minute() {
        return this.#minute;
    }

    set minute(value) {
        if(value < 0 || value > 59) return;
        this.#minute = value;
    }

    get second() {
        return this.#hour;
    }

    set second(value) {
        if(value < 0 || value > 59) return;
        this.#second = value;
    }

    set(h, m, s) {
        if (h != null) {
            if (h < 0 || h > 23) return;
            if (m < 0 || m > 59) return;
            if (s < 0 || s > 59) return;
            this.#hour = h;
            this.#minute = m;
            this.#second = s;
        }
        alt.setSyncedMeta(mp.prefix + 'time', [this.#hour, this.#minute, this.#second]);
    }
}

class _TrafficLights {
    state = 0;
    locked = false;
}

export class _World {
    #weather;

    constructor() {
        this.time = new _Time;
        this.trafficLights = new _TrafficLights;
        this.#weather = 'CLEAR';
    }

    get weather() {
        return this.#weather;
    }

    set weather(value) {
        this.#weather = value;
        alt.setSyncedMeta(mp.prefix + 'weather', value);
        alt.emitAllClients(mp.prefix + 'weather', value);
    }

    setWeatherTransition(weather, easeTime) {
        this.#weather = weather;
        alt.setSyncedMeta(mp.prefix + 'weather', weather);
        alt.emitAllClients(mp.prefix + 'weatherTransition', weather, easeTime);
    }

    removeIpl(ipl) {
        alt.emitAllClients(mp.prefix + 'removeIpl', ipl);
    }
    requestIpl(ipl) {
        alt.emitAllClients(mp.prefix + 'requestIpl', ipl);
    }
}

mp.world = new _World;
