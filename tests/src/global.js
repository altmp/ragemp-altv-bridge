import {describe, it, tryFor} from 'altv-unit-tests';

describe('global', () => {
    it('should hash joaat', async ({ client, server }) => {
        await server(({ mp, alt }) => {
            mp.joaat('test').should.equal(1064684737);
            mp.joaat('tests').should.equal(4054844155); // test for negative sign
        });

        await client(({ mp }) => {
            mp.game.joaat('test').should.equal(1064684737);
            mp.game.joaat('tests').should.equal(4054844155); // test for negative sign
        });
    }, 0);

    it('should populate config', async ({ client, server }) => {
        await server(({ mp, alt }) => {
            const config = alt.getServerConfig();
            mp.config.announce.should.equal(config.announce);
            mp.config.bind.should.equal(config.host);
            mp.config.gamemode.should.equal(config.gamemode);
            mp.config.encryption.should.equal(true);
            mp.config.maxplayers.should.equal(config.players);
            mp.config.name.should.equal(config.name);
            mp.config['stream-distance'].should.equal(config.streamingDistance);
            mp.config.port.should.equal(config.port);
            mp.config['disallow-multiple-connections-per-ip'].should.equal(config.duplicatePlayers <= 1);
            mp.config['limit-time-of-connections-per-ip'].should.equal(0);
            mp.config.url.should.equal(config.website || undefined);
            mp.config.language.should.equal(config.language);
            mp.config['sync-rate'].should.equal(40);
            mp.config['resource-scan-thread-limit'].should.equal(100);
            mp.config['max-ping'].should.equal(undefined);
            mp.config['min-fps'].should.equal(undefined);
            mp.config['max-packet-loss'].should.equal(undefined);
            mp.config['allow-cef-debugging'].should.equal(config.debug);
            mp.config['enable-nodejs'].should.equal(true);
            mp.config.csharp.should.equal('disabled');
            mp.config['enable-http-security'].should.equal(true);
            mp.config['voice-chat'].should.equal(false);
            mp.config['allow-voice-chat-input'].should.equal(undefined);
            mp.config['voice-chat-sample-rate'].should.equal(44100);
            mp.config['fastdl-host'].should.equal(undefined);
            mp.config['server-side-weapons-only-mode'].should.equal(true);
            mp.config['api-threading-debugging'].should.equal(false);
            mp.config['fqdn'].should.equal(undefined);
            mp.config['resources-compression-level'].should.equal(1);
            mp.config['node-commandline-flags'].should.equal(config['js-module']?.['extra-cli-args']?.join(' ') ?? '');
            mp.config['synchronization-extrapolation-multiplier'].should.equal(0);
            mp.config['http-threads'].should.equal(50);
            mp.config['trigger-compression-logging'].should.equal(false);
            mp.config['trigger-compression-training'].should.equal(false);
            mp.config['trigger-compression-dictionary'].should.equal(false);
            mp.config['create-fastdl-snapshot'].should.equal(false);
            mp.config['disable-client-packages-ram-cache'].should.equal(false);
            mp.config['client-packages-shared-folder'].should.equal(undefined);
        });
    }, 0);

    describe('world', () => {
        it('should sync time via arguments', async ({ server, client }) => {
            await server(({ mp }) => {
                mp.world.time.set(13, 0, 0);
            });

            await client(async ({ mp }) => {
                await tryFor(() => mp.game.clock.getHours().should.equal(13));
                await tryFor(() => mp.game.clock.getMinutes().should.equal(0));
            });
        });

        it('should sync time via properties', async ({ server, client }) => {
            await server(({ mp }) => {
                mp.world.time.hour = 26;
                mp.world.time.minute = 4;
                mp.world.time.second = 0;
                mp.world.time.set();
            });

            await client(async ({ mp }) => {
                await tryFor(() => mp.game.clock.getHours().should.equal(26));
                await tryFor(() => mp.game.clock.getMinutes().should.equal(4));
            });
        });

        it('should load ipl', async ({ server, client }) => {
            const ipl = 'prologue01';

            await server(({ mp }) => {
                mp.world.requestIpl(ipl);
            });

            await client(async ({ mp }) => {
                await tryFor(() => mp.game.streaming.isIplActive(ipl).should.equal(true));
            });
        });

        it('should unload ipl', async ({ server, client }) => {
            const ipl = 'prologue01';

            await server(({ mp }) => {
                mp.world.removeIpl(ipl);
            });

            await client(async ({ mp }) => {
                await tryFor(() => mp.game.streaming.isIplActive(ipl).should.equal(false));
            });
        });

        it('should contain traffic lights API', async ({ server, client }) => {
            await server(({ mp }) => {
                mp.world.trafficLights.locked.should.exist;
                mp.world.trafficLights.state.should.exist;
            });
        }, 0);

        it('should sync weather', async ({ server, client }) => {
            const weather = 'XMAS';

            await server(({ mp }) => {
                mp.world.weather.should.exist;
                mp.world.weather.should.not.be.empty;
                mp.world.weather = weather;
                mp.world.weather.should.equal(weather);
            });

            await client(async ({ mp }) => {
                const hash = mp.game.joaat(weather);
                await tryFor(() => mp.game.gameplay.getNextWeatherTypeHashName().should.equal(hash));
            });
        });

        it('should sync weather transition', async ({ server, client }) => {
            const weather = 'CLEAR';

            await server(({ mp }) => {
                mp.world.weather.should.not.equal(weather);
                mp.world.setWeatherTransition(weather, 2000);
                mp.world.weather.should.equal(weather);
            });

            await client(async ({ mp }) => {
                const hash = mp.game.joaat(weather);
                await tryFor(() => mp.game.gameplay.getNextWeatherTypeHashName().should.equal(hash));
                const transition = mp.game.gameplay.getWeatherTypeTransition();
                transition.weatherType1.should.not.equal(transition.weatherType2);
            });
        });
    });

    describe('console', () => {
        it('should contain clear method', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.console.clear();
            });
        });

        it('should contain reset method', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.console.reset();
            });
        });

        it('should log info', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.console.logInfo('test');
            });
        });

        it('should log warning', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.console.logWarning('test');
            });
        });

        it('should log error', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.console.logError('test');
            });
        });

        it('should log fatal', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.console.logFatal('test');
            });
        });

        it('should contain console verbosity', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.console.verbosity.should.satisfy((e) => typeof e === 'string');
            });
        });
    });

    it('should contain discord api', async ({ server, client }) => {
        await client(({ mp }) => {
            mp.discord.should.exist;
            mp.discord.update.should.exist;
            mp.discord.update('Test', 'Test');
        });
    });

    describe('game', async () => {
        it('should execute', async ({ server, client }) => {
            await client(async ({mp}) => {
                mp.game.graphics.returnTwo(0).should.equal(2);
            });
        });

        it('should invoke', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.game.invoke('0x40AFB081F8ADD4EE', 0).should.equal(2);
            });
        });

        it('should invoke float', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.game.invokeFloat('0xF6829842C06AE524', 5000, 5000, 0, 0).should.equal(0);
            });
        });

        it('should invoke string', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.game.invokeString('0xCD90657D4C30E1CA', 0, 0, 0).should.equal('WVINE');
            });
        });

        it('should invoke vector3', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.game.invokeVector3('0x3FEF770D40960D5A', 0, false).should.contain.members(['x', 'y', 'z']);
            });
        });

        it('should wait async', async ({server, client}) => {
            await client(async ({mp}) => {
                const date = Date.now();
                await mp.game.waitAsync(300);
                Date.now().should.be.greaterThanOrEqual(date + 300);
            });
        });
    });

    // TODO: test mp.gui.chat

    describe('gui', () => {
        it('should show cursor', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.gui.cursor.show(false, false);
                mp.gui.cursor.show(false, false);
                mp.gui.cursor.show(false, true);
                mp.gui.cursor.visible.should.be.true;
                alt.isCursorVisible().should.be.true;
            });
        });

        it('should hide cursor', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.gui.cursor.show(false, true);
                mp.gui.cursor.show(false, true);
                mp.gui.cursor.show(false, false);
                mp.gui.cursor.visible.should.be.false;
                alt.isCursorVisible().should.be.false;
            });
        });

        it('should show cursor via property', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.gui.cursor.visible = false;
                mp.gui.cursor.visible = false;
                mp.gui.cursor.visible = true;
                mp.gui.cursor.visible.should.be.true;
                alt.isCursorVisible().should.be.true;
            });
        });

        it('should hide cursor via property', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.gui.cursor.visible = true;
                mp.gui.cursor.visible = true;
                mp.gui.cursor.visible = false;
                mp.gui.cursor.visible.should.be.false;
                alt.isCursorVisible().should.be.false;
            });
        });

        it('should disable controls', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.gui.cursor.show(true, false);
                mp.game.pad.isControlEnabled(0, 0).should.be.false;
            });
        });

        it('should enable controls', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.gui.cursor.show(false, false);
                mp.game.pad.isControlEnabled(0, 0).should.be.true;
            });
        });

        it('should set cursor pos', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.gui.cursor.visible = true;
                mp.gui.cursor.position = [100, 200];
                mp.gui.cursor.position.should.eql([100, 200]);
                alt.getCursorPos(false).x.should.equal(100);
                alt.getCursorPos(false).y.should.equal(200);
            });
        });

        // TODO
        it('should return cef acceleration', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.gui.isGpuRenderingEnabled.should.exist;
            });
        });
    });

    describe('keys', () => {
        it('should indicate key down', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.keys.isDown(32).should.be.false;
            });
        });

        it('should indicate key up', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.keys.isUp(32).should.be.true;
            });
        });

        // binds are not possible to test I think
    });

    describe('preferences', () => {
        it('should return user language', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.user.preferences.language.should.equal(alt.getLocale());
            });
        });

        it('should indicate no low quality assets', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.user.preferences.lowQualityAssets.should.be.false;
            });
        });
    });

    // TODO: raycasts

    describe('storage', () => {
        it('should store integers', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.storage.data.testInt = 5;
                mp.storage.data.testInt.should.equal(5);
                mp.storage.sessionData.testInt = 5;
                mp.storage.sessionData.testInt.should.equal(5);
            });
        });

        it('should store booleans', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.storage.data.testBool = true;
                mp.storage.data.testBool.should.be.true;
                mp.storage.sessionData.testBool = true;
                mp.storage.sessionData.testBool.should.be.true;
            });
        });

        it('should store strings', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.storage.data.testString = 'test';
                mp.storage.data.testString.should.equal('test');
                mp.storage.sessionData.testString = 'test';
                mp.storage.sessionData.testString.should.equal('test');
            });
        });

        it('should flush', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.storage.flush();
                mp.storage.flush();
            });
        });
    });

    describe('system', () => {
        it('should return game fullscreen', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.system.isFullscreen.should.equal(alt.isFullScreen());
            });
        });

        it('should return game focused', async ({server, client}) => {
            await client(async ({mp, alt}) => {
                mp.system.isFocused.should.equal(alt.isGameFocused());
            });
        });

        it('should have notify method', async ({server, client}) => {
            await client(async ({mp}) => {
                mp.system.notify({
                    title: 'test',
                    text: 'test',
                    attribute: 'test',
                    duration: 10000,
                    silent: false
                });
            });
        });
    });
});
