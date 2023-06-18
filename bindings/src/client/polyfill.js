import * as alt from 'alt-client';
import mp from '../shared/mp.js';
import { argsToMp } from '../shared/utils.js';
import * as natives from 'natives';

if (mp._main) {
    alt.onServer(mp.prefix + 'invoke', (native, ...args) => {
        mp.game.invoke(native, ...argsToMp(args).map(e => e.handle ? e.handle : e));
    });

    alt.onServer(mp.prefix + 'removeIpl', (ipl) => {
        alt.removeIpl(ipl);
    });

    alt.onServer(mp.prefix + 'requestIpl', (ipl) => {
        alt.requestIpl(ipl);
    });

    alt.onServer(mp.prefix + 'weather', (weather) => {
        natives.setWeatherTypeNowPersist(weather);
    });

    alt.onServer(mp.prefix + 'weatherTransition', (weather, easeTime) => {
        natives.setWeatherTypeOvertimePersist(weather, easeTime);
    });

    alt.on('globalSyncedMetaChange', (key, value) => {
        if (key !== mp.prefix + 'time') return;
        value ??= [12, 0, 0];
        natives.setClockTime(value[0], value[1], value[2]);
    });

    alt.on('resourceStart', () => {
        natives.setWeatherTypeNowPersist(alt.getSyncedMeta(mp.prefix + 'weather') ?? 'CLEAR');
        const time = alt.getSyncedMeta(mp.prefix + 'time') ?? [12, 0, 0];
        natives.setClockTime(time[0], time[1], time[2]);
    });
}
