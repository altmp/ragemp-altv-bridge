import mp from '../../shared/mp.js';
import * as alt from 'alt-server';

Object.defineProperty(mp, 'config', {
    get: () => {
        const config = alt.getServerConfig();
        return {
            announce: config.announce,
            bind: config.host,
            gamemode: config.gamemode,
            encryption: true,
            maxplayers: config.players,
            name: config.name,
            'stream-distance': config.streamingDistance,
            port: config.port,
            'disallow-multiple-connections-per-ip': config.duplicatePlayers <= 1,
            'limit-time-of-connections-per-ip': 0,
            url: config.website || undefined,
            language: config.language,
            'sync-rate': 40,
            'resource-scan-thread-limit': 100,
            'allow-cef-debugging': config.debug,
            'enable-nodejs': true,
            csharp: 'disabled',
            'enable-http-security': true,
            'voice-chat': false,
            'voice-chat-sample-rate': 44100,
            'server-side-weapons-only-mode': true,
            'api-threading-debugging': false,
            'resources-compression-level': 1,
            'node-commandline-flags': config['js-module']?.['extra-cli-args']?.join(' ') ?? '',
            'synchronization-extrapolation-multiplier': 0,
            'http-threads': 50,
            'trigger-compression-logging': false,
            'trigger-compression-training': false,
            'trigger-compression-dictionary': false,
            'create-fastdl-snapshot': false,
            'disable-client-packages-ram-cache': false,
        };
    }
});
