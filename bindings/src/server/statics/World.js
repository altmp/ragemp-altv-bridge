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
        if(value < 0 || value > 23) throw new Error('The valid values for hour is from 0 to 23');
        this.#hour = value;
    }

    get minute() {
        return this.#minute;
    }

    set minute(value) {
        if(value < 0 || value > 59) throw new Error('The valid values for minute is from 0 to 59');
        this.#minute = value;
    }

    get second() {
        return this.#hour;
    }

    set second(value) {
        if(value < 0 || value > 59) throw new Error('The valid values for second is from 0 to 59');
        this.#second = value;
    }

    set(h, m, s) {
        if(h < 0 || h > 23) throw new Error('The valid values for hour is from 0 to 23');
        if(m < 0 || m > 59) throw new Error('The valid values for minute is from 0 to 59');
        if(s < 0 || s > 59) throw new Error('The valid values for second is from 0 to 59');
        this.#hour = h;
        this.#minute = m;
        this.#second = s;
    }
}

class _TrafficLights {
    #state;

    constructor() {
        this.#state = 0;
    }

    get state() {
        return this.#state;
    }

    set state(value) {
        this.#state = value;
    }
}

export class _World {
    #weather;
    #easeTime;
    
    constructor() {
        this.time = new _Time;
        this.trafficLights = new _TrafficLights;
        this.#weather = "CLEAR";
        this.#easeTime = -1;
    }

    get weather() {
        return this.#weather;
    }

    set weather(value) {
        this.#weather = value;
    }

    setWeatherTransition(weather, easeTime) {
        this.#weather = weather;
        if(easeTime) {
            this.#easeTime = easeTime;
        }
    }

    removeIpl(ipl) {}
    requestIpl(ipl) {}
}

mp.world = new _World;