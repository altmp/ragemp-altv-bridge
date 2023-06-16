import {afterEach, beforeEach, describe, it, tryFor, waitFor} from 'testlib/index.js';

describe('vehicle', () => {
    describe('multiple vehicles', () => {
        const vehCount = 5;
        /** @type {(import('mp-client').mp.Vehicle | import('mp-server').mp.Vehicle)[]} */
        let vehs = [];

        beforeEach(async ({ server, client, player }) => {
            await server(async ({mp}) => {
                player.spawn(new mp.Vector3(0, 0, 73));
                mp.vehicles.toArray().should.be.empty;
                for (let i = 0; i < vehCount; i++) {
                    vehs.push(mp.vehicles.new('t20', new mp.Vector3(2, 2, 73), { dimension: player.dimension }));
                }
                mp.vehicles.toArray().should.not.be.empty;
                mp.vehicles.toArray().length.should.equal(vehCount);
                mp.vehicles.length.should.equal(vehCount);
            });

            await client(async ({mp}) => {
                await waitFor(() => mp.vehicles.toArray().length === vehCount);
                vehs = mp.vehicles.toArray();
            });
        });

        afterEach(async ({ server, client, player }) => {
            await server(async ({mp}) => {
                for (let veh of vehs) {
                    if (veh) veh.destroy();
                }
                vehs = [];
            });

            await client(async ({mp}) => {
                vehs = [];
            });
        });

        it('should create', async ({server, client}) => {
            await server(async ({mp}) => {
                for (let veh of vehs) {
                    veh.should.exist;
                }
            });

            await client(async ({mp}) => {
                for (let veh of vehs) {
                    veh.should.exist;
                    await tryFor(() => veh.handle.should.not.equal(0));
                }
            });
        });

        it('should be accessible by id', async ({server, client}) => {
            await server(async ({mp}) => {
                for (let veh of vehs) {
                    mp.vehicles.at(veh.id).should.equal(veh);
                }
            });

            await client(async ({mp}) => {
                for (let veh of vehs) {
                    mp.vehicles.at(veh.id).should.equal(veh);
                }
            });
        });

        it('should be accessible by remote id', async ({server, client}) => {
            await client(async ({mp}) => {
                for (let veh of vehs) {
                    mp.vehicles.atRemoteId(veh.remoteId).should.equal(veh);
                }
            });
        });

        it('should be accessible by handle', async ({server, client}) => {
            await client(async ({mp}) => {
                for (let veh of vehs) {
                    await tryFor(() => veh.handle.should.not.equal(0));
                    mp.vehicles.atHandle(veh.handle).should.equal(veh);
                }
            });
        });
    });

    describe('single vehicle', () => {
        /** @type {import('mp-client').mp.Vehicle | import('mp-server').mp.Vehicle} */
        let veh = null;
        beforeEach(async ({ server, client, player, params }) => {
            await server(async ({mp}) => {
                player.spawn(new mp.Vector3(0, 0, 73));
                mp.vehicles.toArray().should.be.empty;
                veh = mp.vehicles.new(params.model ?? 't20', new mp.Vector3(2, 2, 73), { dimension: player.dimension });
                veh.alt.setNetOwner(player.alt, true);
                mp.vehicles.toArray().should.not.be.empty;
                mp.vehicles.toArray().length.should.equal(1);
                mp.vehicles.length.should.equal(1);
            });

            await client(async ({mp}) => {
                await waitFor(() => mp.vehicles.toArray().length === 1);
                veh = mp.vehicles.toArray()[0];
            });
        });

        afterEach(async ({ server, client, player }) => {
            await server(async ({mp}) => {
                if (veh) veh.destroy();
                veh = null;
            });

            await client(async ({mp}) => {
                veh = null;
            });
        });

        it('should return correct type', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.type.should.equal('vehicle');
            });

            await client(async ({mp}) => {
                veh.type.should.equal('vehicle');
            });
        });

        it('should return correct position', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.position = new mp.Vector3(4, 3, 73);
                veh.position.x.should.equal(4);
                veh.position.y.should.equal(3);
                veh.position.z.should.equal(73);
            });
        }, 0);

        it('should sync position', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.position = new mp.Vector3(3, 4, 73);
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getCoords(false).x.should.be.approximately(3, 0.01));
                await tryFor(() => veh.getCoords(false).y.should.be.approximately(4, 0.01));
            });
        });

        it('should return correct model', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.model.should.equal(mp.joaat('t20'));
                veh.model = mp.joaat('neon');
                veh.model.should.equal(mp.joaat('neon'));
            });
        }, 0);

        it('should sync model changes', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.model.should.equal(mp.game.joaat('t20'));
            });

            await server(async ({mp}) => {
                veh.model = mp.joaat('neon');
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getModel().should.equal(mp.game.joaat('neon')));
                await tryFor(() => veh.model.should.equal(mp.game.joaat('neon')));
            });
        });

        it('should sync data via property', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.data.testInt = 4;
                veh.data.testBool = false;
                veh.data.testString = 'why';
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getVariable('testInt').should.equal(4));
                await tryFor(() => veh.getVariable('testBool').should.be.false);
                await tryFor(() => veh.getVariable('testString').should.equal('why'));
            });
        });

        it('should sync data via method', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setVariable('testIntMethod', 2);
                veh.setVariable('testBoolMethod', true);
                veh.setVariable('testStringMethod', 'why2');
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getVariable('testIntMethod').should.equal(2));
                await tryFor(() => veh.getVariable('testBoolMethod').should.be.true);
                await tryFor(() => veh.getVariable('testStringMethod').should.equal('why2'));
            });
        });

        it('should sync data via batch method', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setVariables({
                    testIntMethodBatch: 8,
                    testBoolMethodBatch: false,
                    testStringMethodBatch: 'why3'
                });
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getVariable('testIntMethodBatch').should.equal(8));
                await tryFor(() => veh.getVariable('testBoolMethodBatch').should.be.false);
                await tryFor(() => veh.getVariable('testStringMethodBatch').should.equal('why3'));
            });
        });

        it('should return data via property', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setVariable('testIntPropertyGet', 5);
                veh.setVariable('testBoolPropertyGet', false);
                veh.setVariable('testStringPropertyGet', 'lol');
                veh.data.testIntPropertyGet.should.equal(5);
                veh.data.testBoolPropertyGet.should.equal(false);
                veh.data.testStringPropertyGet.should.equal('lol');
            });
        }, 0);

        it('should return data via method', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setVariable('testIntMethodGet', 5);
                veh.setVariable('testBoolMethodGet', false);
                veh.setVariable('testStringMethodGet', 'lol');
                veh.getVariable('testIntMethodGet').should.equal(5);
                veh.getVariable('testBoolMethodGet').should.equal(false);
                veh.getVariable('testStringMethodGet').should.equal('lol');
            });
        }, 0);

        it('should return correct alpha', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.alpha = 64;
                veh.alpha.should.equal(64);
            });
        }, 0);

        // alpha sync is broken in ragemp
        // it('should sync alpha', async ({server, client}) => {
        //     await server(async ({mp}) => {
        //         veh.alpha = 128;
        //     });
        //
        //     await client(async ({mp}) => {
        //         await tryFor(() => veh.getAlpha().should.equal(128));
        //     });
        // });

        it('should return correct dimension', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.dimension = 6;
                veh.dimension.should.equal(6);
            });
        }, 0);

        it('should sync dimension', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.dimension = -1;
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.dimension.should.equal(-1));
            });
        });

        it('should stream accordingly to dimension', async ({server, client}) => {
            await client(async ({mp}) => {
                await tryFor(() => veh.handle.should.not.equal(0));
            });

            await server(async ({mp}) => {
                veh.dimension = 5;
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.handle.should.equal(0));
            });

            await server(async ({mp}) => {
                veh.dimension = -1;
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.handle.should.not.equal(0));
            });
        });

        it('should return correct stock wheel type', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.wheelType.should.equal(255);
            });
        }, 0);

        it('should return correct wheel type', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.wheelType = 6;
                veh.wheelType.should.equal(6);
            });
        }, 0);

        it('should sync wheel type', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.wheelType = 7;
            });

            await client(async ({mp}) => {
                veh.getWheelType().should.equal(7);
            });
        });

        it('should return correct stock wheel color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.wheelColor.should.equal(255);
            });
        }, 0);

        it('should return correct wheel color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.wheelColor = 8;
                veh.wheelColor.should.equal(8);
            });
        }, 0);

        it('should sync wheel color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.wheelColor = 67;
            });

            await client(async ({mp}) => {
                veh.getExtraColours(0, 0).wheelColor.should.equal(67);
            });
        });

        it('should return correct stock window tint', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.windowTint.should.equal(255);
            });
        }, 0);

        it('should return correct window tint', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.windowTint = 3;
                veh.windowTint.should.equal(3);
            });
        }, 0);

        it('should sync window tint', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.windowTint = 4;
            });

            await client(async ({mp}) => {
                veh.getWindowTint().should.equal(4);
            });
        });

        // TODO: trim color?

        // TODO: trailer sync test

        it('should return correct taxi lights state', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.taxiLights = true;
                veh.taxiLights.should.be.true;
                veh.taxiLights = false;
                veh.taxiLights.should.be.false;
            });
        }, 0);

        it('should sync taxi lights', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.taxiLights = true;
            });

            await client(async ({mp}) => {
                veh.isTaxiLightOn().should.be.true;
            });
        });

        it('should return streamed players', async ({server, client, player}) => {
            await server(async ({mp}) => {
                await tryFor(() => veh.streamedPlayers.should.not.be.empty);
                veh.streamedPlayers[0].should.equal(player);
                veh.dimension = 5;
                await tryFor(() => veh.streamedPlayers.should.be.empty);
            });
        });

        it('should return correct rotation', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.rotation = new mp.Vector3(0, 0, 180);
                veh.rotation.should.eql(new mp.Vector3(0, 0, 180));
            });
        }, 0);

        it('should sync rotation', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.rotation = new mp.Vector3(0, 0, 90);
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.rotation.x.should.be.approximately(0, 0.5));
                await tryFor(() => veh.rotation.y.should.be.approximately(0, 0.5));
                await tryFor(() => veh.rotation.z.should.be.approximately(90, 0.5));
            });
        });

        // TODO: rocket boost sync

        it('should return correct pearl color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.pearlescentColor = 95;
                veh.pearlescentColor.should.equal(95);
            });
        }, 0);

        it('should sync pearl color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.pearlescentColor = 100;
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getModColor1(0, 0, 0).pearlescentColor.should.equal(100));
            });
        });

        it('should return correct numberplate color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.numberPlateType = 3;
                veh.numberPlate = 'test';
                veh.numberPlateType.should.equal(3);
                veh.numberPlate.should.equal('test');
            });
        }, 0);

        it('should sync numberplate', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.numberPlateType = 1;
                veh.numberPlate = 'zziger';
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getNumberPlateTextIndex().should.equal(1));
                await tryFor(() => veh.getNumberPlateText().should.equal('zziger'));
            });
        });

        it('should return correct neon color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setNeonColor(255, 64, 128);
                veh.getNeonColor().should.eql([255, 64, 128]);
            });
        }, 0);

        it('should return correct neon state', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.neonEnabled = true;
                veh.neonEnabled.should.be.true;
                veh.neonEnabled = false;
                veh.neonEnabled.should.be.false;
            });
        }, 0);

        it('should sync neon', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setNeonColor(255, 128, 64);
                veh.neonEnabled = true;
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getNeonLightsColour(0, 0, 0).should.eql({ r: 255, g: 128, b: 64 }));
                await tryFor(() => veh.isNeonLightEnabled(0).should.be.true);
            });
        });

        it('should return correct lock state', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.locked = true;
                veh.locked.should.be.true;
                veh.locked = false;
                veh.locked.should.be.false;
            });
        }, 0);

        it('should sync lock state', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.locked = true;
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getDoorLockStatus().should.be.oneOf([ 2, 3 ]));
            });
        });

        it('should return correct livery', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.livery = 1;
                veh.livery.should.equal(1);
            });
        }, 0, { model: 'police' });

        it('should sync livery', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.livery = 2;
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getLivery().should.equal(2));
            });
        }, 1, { model: 'police' });

        // highbeams seem to not work on ragemp
        // extras seem to not work on ragemp

        it('should return correct engine state', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.engine = true;
                veh.engine.should.be.true;
                veh.engine = false;
                veh.engine.should.be.false;
            });
        }, 0);

        it('should sync engine state', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.engine = true;
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getIsEngineRunning().should.be.true);
            });
        });

        // dead getter is broken in ragemp

        it('should sync vehicle explosion', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.explode();
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.isDead().should.be.true);
            });
        });

        it('should return correct dashboard color', async ({server, client}) => {
            veh.dashboardColor = 14;
            veh.dashboardColor.should.equal(14);
        }, 0);

        it('should sync dashboard color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.dashboardColor = 39;
            });

            await client(async ({mp}) => {
                await tryFor(() => mp.game.vehicle.getDashboardColor(veh.handle).should.equal(39));
            });
        });

        // brake getter is broken on ragemp

        it('should return correct color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setColor(36, 24);
                veh.getColor(0).should.equal(36);
                veh.getColor(1).should.equal(24);
            });
        }, 0);

        it('should sync color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setColor(23, 15);
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getModColor1(0, 0, 0).color.should.equal(23));
                await tryFor(() => veh.getModColor2(0, 0).color.should.equal(15));
            });
        });

        it('should return correct rgb color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setColorRGB(255, 128, 64, 128, 64, 255);
                veh.getColorRGB(0).should.eql([255, 128, 64]);
                veh.getColorRGB(1).should.eql([128, 64, 255]);
            });
        }, 0);

        it('should sync rgb color', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setColorRGB(255, 128, 64, 128, 64, 255);
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getCustomPrimaryColour(0, 0, 0).should.eql({ r: 255, g: 128, b: 64 }));
                await tryFor(() => veh.getCustomSecondaryColour(0, 0, 0).should.eql({ r: 128, g: 64, b: 255 }));
            });
        });

        it('should return correct extras state', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setExtra(4, false);
                veh.setExtra(5, true);
                veh.getExtra(4).should.be.false;
                veh.getExtra(5).should.be.true;
            });
        }, 0);

        it('should sync extras', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setExtra(4, true);
                veh.setExtra(5, false);
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.isExtraTurnedOn(4).should.be.true);
                await tryFor(() => veh.isExtraTurnedOn(5).should.be.false);
            });
        });

        it('should return correct mod value', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setMod(4, 2);
                veh.getMod(4).should.equal(2);
            });
        }, 0);

        it('should sync mods', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setMod(4, 1);
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getMod(4).should.equal(1));
            });
        });

        it('should manage occupants', async ({server, client, player}) => {
            await client(async ({mp}) => {
                player.isInAnyVehicle().should.be.false;
            });

            await server(async ({mp}) => {
                veh.getOccupants().should.be.empty;
                veh.setOccupant(0, player);
                await tryFor(() => veh.getOccupants().should.not.be.empty);
                veh.getOccupant(0).should.equal(player);
            });

            await client(async ({mp}) => {
                player.isInAnyVehicle().should.be.true;
            });
        });

        // paint getter serverside is broken

        it('should sync paint', async ({server, client}) => {
            await server(async ({mp}) => {
                veh.setPaint(4, 5, 3, 2);
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getModColor1(0, 0, 0).paintType.should.equal(4));
                await tryFor(() => veh.getModColor1(0, 0, 0).color.should.equal(5));
                await tryFor(() => veh.getModColor2(0, 0).paintType.should.equal(3));
                await tryFor(() => veh.getModColor2(0, 0).color.should.equal(2));
            });
        });

        it('should return is streamed for player', async ({server, client, player}) => {
            await server(async ({mp}) => {
                veh.isStreamed(player).should.be.true;
                veh.dimension = 5;
                await tryFor(() => veh.isStreamed(player).should.be.false);
            });
        });

        it('should repair vehicle', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setEngineHealth(500);
            });

            await server(async ({mp}) => {
                await tryFor(() => veh.engineHealth.should.equal(500));
                veh.repair();
                await tryFor(() => veh.engineHealth.should.equal(1000));
            });
        });

        it('should spawn', async ({server, client}) => {
            await server(async ({mp}) => {
                // in ragemp this method accepts radians for some reason 🤨
                veh.spawn(new mp.Vector3(3, 3, 72), Math.PI);
            });

            await client(async ({mp}) => {
                await tryFor(() => veh.getCoords(false).x.should.be.approximately(3, 0.01));
                await tryFor(() => veh.getCoords(false).y.should.be.approximately(3, 0.01));
                await tryFor(() => veh.getRotation(2).z.should.be.approximately(180, 0.1));
            });
        });

        it('should calculate distance correctly', async ({server, client, player}) => {
            await server(async ({mp}) => {
                const ppos = player.position;
                const vpos = veh.position;

                const distSquared = veh.distSquared(ppos);
                const dist = veh.dist(ppos);
                dist.should.be.approximately(Math.sqrt(distSquared), 0.05);
                distSquared.should.be.approximately((ppos.x - vpos.x) ** 2 + (ppos.y - vpos.y) ** 2 + (ppos.z - vpos.z) ** 2, 1);
            });
        });

        it('should return if position is frozen', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.freezePosition(true);
                veh.isPositionFrozen.should.be.true;
                veh.freezePosition(false);
                veh.isPositionFrozen.should.be.false;
            });
        });

        it('should return correct wheel count for t20', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.wheelCount.should.equal(4);
            });
        });

        it('should return correct wheel count for oppressor', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.wheelCount.should.equal(2);
            });
        }, 1, { model: 'oppressor' });

        it('should set handling', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.getDefaultHandling('fMass').should.not.equal(3653);
                veh.getHandling('fMass').should.not.equal(3653);
                veh.setHandling('fMass', 3653);
                veh.getDefaultHandling('fMass').should.not.equal(3653);
                veh.getHandling('fMass').should.equal(3653);
            });
        });

        it('should set suspension height', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.getSuspensionHeight().should.not.equal(3);
                veh.setSuspensionHeight(3);
                veh.getSuspensionHeight().should.equal(3);
            });
        });

        it('should set rim radius', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setRimRadius(0, 5);
                veh.setRimRadius(1, 3);
                veh.getRimRadius(0).should.equal(5);
                veh.getRimRadius(1).should.equal(3);
            });
        });

        it('should set tyre width', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setTyreWidth(0, 5);
                veh.setTyreWidth(1, 8);
                veh.getTyreWidth(0).should.equal(5);
                veh.getTyreWidth(1).should.equal(8);
            });
        });

        it('should set tyre radius', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setTyreRadius(0, 5);
                veh.setTyreRadius(1, 8);
                veh.getTyreRadius(0).should.equal(5);
                veh.getTyreRadius(1).should.equal(8);
            });
        });

        it('should set wheel radius', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setWheelRadius(5);
                veh.getWheelRadius().should.equal(5);
            });
        });

        it('should set wheel width', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setWheelWidth(5);
                veh.getWheelWidth().should.equal(5);
            });
        });

        it('should set wheel height', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setWheelHeight(0, 5);
                veh.setWheelHeight(1, 8);
                veh.getWheelHeight(0).should.equal(5);
                veh.getWheelHeight(1).should.equal(8);
            });
        });

        it('should set wheel track width', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setWheelTrackWidth(0, 5);
                veh.setWheelTrackWidth(1, 8);
                veh.getWheelTrackWidth(0).should.equal(5);
                veh.getWheelTrackWidth(1).should.equal(8);
            });
        });

        it('should set wheel camber', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setWheelCamber(0, 5);
                veh.setWheelCamber(1, 8);
                veh.getWheelCamber(0).should.equal(5);
                veh.getWheelCamber(1).should.equal(8);
            });
        });

        it('should sync position from client', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.position = new mp.Vector3(5, 5, 73);
            });

            await server(async ({mp}) => {
                await tryFor(() => veh.position.x.should.be.approximately(5, 0.01));
                await tryFor(() => veh.position.y.should.be.approximately(5, 0.01));
            });
        });

        it('should sync position from client via native', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setCoordsNoOffset(5, 5, 73, false, false, false);
            });

            await server(async ({mp}) => {
                await tryFor(() => veh.position.x.should.be.approximately(5, 0.01));
                await tryFor(() => veh.position.y.should.be.approximately(5, 0.01));
            });
        });

        it('should sync rotation from client', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.rotation = new mp.Vector3(0, 0, 90);
            });

            await server(async ({mp}) => {
                await tryFor(() => veh.rotation.x.should.be.approximately(0, 1));
                await tryFor(() => veh.rotation.y.should.be.approximately(0, 1));
                await tryFor(() => veh.position.z.should.be.approximately(90, 1));
            });
        });

        it('should sync velocity from client', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setVelocity(3, 3, 3);
            });

            await server(async ({mp}) => {
                await tryFor(() => [veh.velocity.x, veh.velocity.y, veh.velocity.z].filter(e => e !== 0).should.not.be.empty);
            });
        });

        it('should sync body health from client', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setBodyHealth(500);
            });

            await server(async ({mp}) => {
                await tryFor(() => veh.bodyHealth.should.equal(500));
            });
        });

        it('should sync engine health from client', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setEngineHealth(500);
            });

            await server(async ({mp}) => {
                await tryFor(() => veh.engineHealth.should.equal(500));
            });
        });

        it('should sync horn from client', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.startHorn(1000, mp.game.joaat('HELDDOWN'), true);
            });

            await server(async ({mp}) => {
                await tryFor(() => veh.horn.should.be.true);
            });
        });

        it('should sync siren from client', async ({server, client}) => {
            await client(async ({mp}) => {
                veh.setSiren(true);
            });

            await server(async ({mp}) => {
                await tryFor(() => veh.siren.should.be.true);
            });
        });

        it('should unstream when out of stream range', async ({server, client, player}) => {
            await client(async ({mp}) => {
                await tryFor(() => veh.handle.should.not.equal(0));
                player.setCoordsNoOffset(10000, 10000, 0, false, false, false);
                await tryFor(() => veh.handle.should.equal(0));
            });
        });

        // TODO: trailer
    });
});
