import * as alt from 'alt-client';
import mp from '../shared/mp.js';
import {argsToMp, internalName} from '../shared/utils.js';
import * as natives from 'natives';

if (mp._main) {
    alt.onServer(internalName('invoke'), (native, ...args) => {
        mp.game.invoke(native, ...argsToMp(args).map(e => e.handle ? e.handle : e));
    });

    alt.onServer(internalName('removeIpl'), (ipl) => {
        alt.removeIpl(ipl);
    });

    alt.onServer(internalName('requestIpl'), (ipl) => {
        alt.requestIpl(ipl);
    });

    alt.onServer(internalName('weather'), (weather) => {
        natives.setWeatherTypeNowPersist(weather);
    });

    alt.onServer(internalName('weatherTransition'), (weather, easeTime) => {
        natives.setWeatherTypeOvertimePersist(weather, easeTime);
    });

    alt.on('globalSyncedMetaChange', (key, value) => {
        if (key !== internalName('time')) return;
        value ??= [12, 0, 0];
        natives.setClockTime(value[0], value[1], value[2]);
    });

    alt.on('resourceStart', () => {
        natives.setWeatherTypeNowPersist(alt.getSyncedMeta(internalName('weather')) ?? 'CLEAR');
        const time = alt.getSyncedMeta(internalName('time')) ?? [12, 0, 0];
        natives.setClockTime(time[0], time[1], time[2]);
    });
}
