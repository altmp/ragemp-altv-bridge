import {afterAll, afterEach, beforeAll, beforeEach, describe, it, tryFor, waitFor, chai} from 'testlib/index.js';

const should = chai.should;

describe('ped', () => {
    describe('server', () => {
        describe('multiple peds', () => {
            const pedCount = 5;
            /** @type {(import('mp-client').mp.Ped | import('mp-server').mp.Ped)[]} */
            let peds = [];

            beforeEach(async ({server, client, player}) => {
                await server(async ({mp}) => {
                    player.spawn(new mp.Vector3(0, 0, 73));
                    mp.peds.toArray().should.be.empty;
                    for (let i = 0; i < pedCount; i++) {
                        peds.push(mp.peds.new('mp_f_freemode_01', new mp.Vector3(2, 2, 73), {dimension: player.dimension}));
                    }
                    mp.peds.toArray().should.not.be.empty;
                    mp.peds.toArray().length.should.equal(pedCount);
                    mp.peds.length.should.equal(pedCount);
                });

                await client(async ({mp}) => {
                    await waitFor(() => mp.peds.toArray().length === pedCount);
                    peds = mp.peds.toArray();
                });
            });

            afterEach(async ({server, client, player}) => {
                await server(async ({mp}) => {
                    for (let ped of peds) {
                        if (ped) ped.destroy();
                    }
                    peds = [];
                });

                await client(async ({mp}) => {
                    peds = [];
                });
            });

            it('should create', async ({server, client}) => {
                await server(async ({mp}) => {
                    for (let ped of peds) {
                        ped.should.exist;
                    }
                });

                await client(async ({mp}) => {
                    for (let ped of peds) {
                        ped.should.exist;
                        await tryFor(() => ped.handle.should.not.equal(0));
                    }
                });
            });

            it('should be accessible by id', async ({server, client, player}) => {
                await server(async ({mp}) => {
                    for (let ped of peds) {
                        mp.peds.at(ped.id).should.equal(ped);
                    }
                });

                await client(async ({mp}) => {
                    for (let ped of peds) {
                        mp.peds.at(ped.id).should.equal(ped);
                    }
                });
            });

            it('should be accessible by remote id', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    for (let ped of peds) {
                        mp.peds.atRemoteId(ped.remoteId).should.equal(ped);
                    }
                });
            });

            it('should be accessible by handle', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    for (let ped of peds) {
                        await tryFor(() => ped.handle.should.not.equal(0));
                        mp.peds.atHandle(ped.handle).should.equal(ped);
                    }
                });
            });
        });

        describe('single ped', () => {
            /** @type {import('mp-client').mp.Ped | import('mp-server').mp.Ped} */
            let ped = null;
            beforeEach(async ({server, client, player, params}) => {
                await server(async ({mp}) => {
                    player.spawn(new mp.Vector3(0, 0, 73));
                    player.dimension = 0;
                    mp.peds.toArray().should.be.empty;
                    ped = mp.peds.new(params.model ?? 'mp_f_freemode_01', new mp.Vector3(2, 2, 73), {dimension: player.dimension});
                    ped.alt.setNetOwner(player.alt, true);
                    mp.peds.toArray().should.not.be.empty;
                    mp.peds.toArray().length.should.equal(1);
                    mp.peds.length.should.equal(1);
                });

                await client(async ({mp}) => {
                    await waitFor(() => mp.peds.toArray().length === 1);
                    ped = mp.peds.toArray()[0];
                    await waitFor(() => ped.handle !== 0);
                });
            });

            afterEach(async ({server, client, player}) => {
                await server(async ({mp}) => {
                    if (ped) ped.destroy();
                    ped = null;
                });

                await client(async ({mp}) => {
                    ped = null;
                });
            });

            it('should return correct type', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.type.should.equal('vehicle');
                });

                await client(async ({mp}) => {
                    ped.type.should.equal('vehicle');
                });
            });

            it('should return correct position', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.position = new mp.Vector3(4, 3, 73);
                    ped.position.x.should.equal(4);
                    ped.position.y.should.equal(3);
                    ped.position.z.should.equal(73);
                });
            }, 0);

            it('should sync position', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.position = new mp.Vector3(4, 3, 73);
                });

                await client(async ({mp}) => {
                    await tryFor(() => ped.position.x.should.be.approximately(4, 0.5));
                    await tryFor(() => ped.position.y.should.be.approximately(4, 0.5));
                });
            });

            it('should return correct model', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.model.should.equal('mp_f_freemode_01');
                    ped.model = mp.joaat('mp_m_freemode_01');
                    ped.model.should.equal('mp_m_freemode_01');
                });
            });

            it('should sync model', async ({server, client}) => {
                await client(async ({mp}) => {
                    ped.model.should.equal('mp_f_freemode_01');
                });

                await server(async ({mp}) => {
                    ped.model = mp.joaat('mp_m_freemode_01');
                });

                await client(async ({mp}) => {
                    await tryFor(() => ped.getModel().should.equal('mp_m_freemode_01'));
                    await tryFor(() => ped.model.should.equal('mp_m_freemode_01'));
                });
            });


            it('should sync data via property', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.data.testInt = 4;
                    ped.data.testBool = false;
                    ped.data.testString = 'why';
                });

                await client(async ({mp}) => {
                    await tryFor(() => ped.getVariable('testInt').should.equal(4));
                    await tryFor(() => ped.getVariable('testBool').should.be.false);
                    await tryFor(() => ped.getVariable('testString').should.equal('why'));
                });
            });

            it('should sync data via method', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.setVariable('testIntMethod', 2);
                    ped.setVariable('testBoolMethod', true);
                    ped.setVariable('testStringMethod', 'why2');
                });

                await client(async ({mp}) => {
                    await tryFor(() => ped.getVariable('testIntMethod').should.equal(2));
                    await tryFor(() => ped.getVariable('testBoolMethod').should.be.true);
                    await tryFor(() => ped.getVariable('testStringMethod').should.equal('why2'));
                });
            });

            it('should sync data via batch method', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.setVariables({
                        testIntMethodBatch: 8,
                        testBoolMethodBatch: false,
                        testStringMethodBatch: 'why3'
                    });
                });

                await client(async ({mp}) => {
                    await tryFor(() => ped.getVariable('testIntMethodBatch').should.equal(8));
                    await tryFor(() => ped.getVariable('testBoolMethodBatch').should.be.false);
                    await tryFor(() => ped.getVariable('testStringMethodBatch').should.equal('why3'));
                });
            });

            it('should return data via property', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.setVariable('testIntPropertyGet', 5);
                    ped.setVariable('testBoolPropertyGet', false);
                    ped.setVariable('testStringPropertyGet', 'lol');
                    ped.data.testIntPropertyGet.should.equal(5);
                    ped.data.testBoolPropertyGet.should.equal(false);
                    ped.data.testStringPropertyGet.should.equal('lol');
                });
            }, 0);

            it('should return data via method', async ({server, client}) => {
                await server(async ({mp}) => {
                    ped.setVariable('testIntMethodGet', 5);
                    ped.setVariable('testBoolMethodGet', false);
                    ped.setVariable('testStringMethodGet', 'lol');
                    ped.getVariable('testIntMethodGet').should.equal(5);
                    ped.getVariable('testBoolMethodGet').should.equal(false);
                    ped.getVariable('testStringMethodGet').should.equal('lol');
                });
            }, 0);
        });

    });

    describe('local', () => {
        describe('multiple peds', () => {
            const pedCount = 5;
            /** @type {(import('mp-client').mp.Ped)[]} */
            let peds = [];

            beforeEach(async ({server, client, player}) => {
                await server(async ({mp}) => {
                    player.spawn(new mp.Vector3(0, 0, 73));
                });

                await client(async ({mp}) => {
                    mp.peds.toArray().should.be.empty;
                    for (let i = 0; i < pedCount; i++) {
                        peds.push(mp.peds.new(mp.game.joaat('mp_f_freemode_01'), new mp.Vector3(0, 0, 73), 0, player.dimension));
                    }
                    mp.peds.toArray().should.not.be.empty;
                    mp.peds.toArray().length.should.equal(pedCount);
                    mp.peds.length.should.equal(pedCount);
                });
            });

            afterEach(async ({server, client}) => {
                await client(async ({mp}) => {
                    peds.forEach(ped => ped.destroy());
                    peds = [];
                    mp.peds.toArray().should.be.empty;
                });
            });

            it('should create', async ({server, client}) => {
                await client(async ({mp}) => {
                    for (let ped of peds) {
                        ped.should.exist;
                        await tryFor(() => ped.handle.should.not.equal(0));
                    }
                });
            });

            it('should be accessible by id', async ({server, client}) => {
                await client(async ({mp}) => {
                    for (let ped of peds) {
                        mp.peds.at(ped.id).should.exist;
                        mp.peds.at(ped.id).should.equal(ped);
                    }
                });
            });

            it('should be accessible by handle', async ({server, client}) => {
                await client(async ({mp}) => {
                    for (let ped of peds) {
                        await tryFor(() => ped.handle.should.not.equal(0));
                        mp.peds.atHandle(ped.handle).should.exist;
                        mp.peds.atHandle(ped.handle).should.equal(ped);
                    }
                });
            });
        });

        describe('single ped', () => {
            /** @type {import('mp-client').mp.Ped} */
            let ped = null;

            beforeEach(async ({server, client, player, params}) => {
                await server(async ({mp}) => {
                    player.spawn(new mp.Vector3(0, 0, 73));
                    player.dimension = 0;
                });

                await client(async ({mp}) => {
                    mp.peds.toArray().should.be.empty;
                    ped = mp.peds.new(mp.game.joaat('mp_f_freemode_01'), new mp.Vector3(0, 0, 73), 90, player.dimension);
                    mp.peds.toArray().should.not.be.empty;
                    mp.peds.toArray().length.should.equal(1);
                    mp.peds.length.should.equal(1);
                    await waitFor(() => ped.handle !== 0);
                });
            });

            afterEach(async ({server, client, player}) => {
                await client(async ({mp}) => {
                    if (ped) ped.destroy();
                    ped = null;
                });
            });

            it('should return correct type', async ({server, client}) => {
                await client(async ({mp}) => {
                    ped.type.should.equal('ped');
                });
            });

            it('should return correct remote id', async ({server, client}) => {
                await client(async ({mp}) => {
                    ped.remoteId.should.equal(65535);
                });
            });

            it('should reutrn correct position', async ({server, client}) => {
                await client(async ({mp}) => {
                    ped.position = new mp.Vector3(4, 3, 73);
                    await tryFor(() => ped.position.x.should.be.approximately(4, 1));
                    await tryFor(() => ped.position.y.should.be.approximately(3, 1));
                });
            });

            it('should return correct model', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    ped.model.should.equal(mp.game.joaat('mp_f_freemode_01'));
                    ped.model = mp.game.joaat('mp_m_freemode_01');
                    ped.model.should.equal(mp.game.joaat('mp_m_freemode_01'));
                });
            });

            it('should return correct rotation', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    await tryFor(() => ped.rotation.z.should.be.approximately(90, 3));
                    ped.rotation = new mp.Vector3(0, 0, 180);
                    await tryFor(() => Math.abs(ped.rotation.z).should.be.approximately(180, 3));
                });
            });

            it('should restream on model change', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    const handle = ped.handle;
                    ped.model = mp.game.joaat('mp_m_freemode_01');
                    ped.model.should.equal(mp.game.joaat('mp_m_freemode_01'));
                    await tryFor(() => ped.handle.should.not.equal(handle));
                });
            });

            it('should return data via method', async ({server, client}) => {
                await client(async ({mp}) => {
                    ped.setVariable('testIntMethodGet', 5);
                    ped.setVariable('testBoolMethodGet', false);
                    ped.setVariable('testStringMethodGet', 'lol');
                    ped.getVariable('testIntMethodGet').should.equal(5);
                    ped.getVariable('testBoolMethodGet').should.equal(false);
                    ped.getVariable('testStringMethodGet').should.equal('lol');
                });
            });

            it('should return correct dimension', async ({server, client}) => {
                await client(async ({mp}) => {
                    ped.dimension = 123;
                    ped.dimension.should.equal(123);
                });
            });

            it('should stream accordingly to dimension', async ({server, client}) => {
                await client(async ({mp}) => {
                    await tryFor(() => ped.handle.should.not.equal(0));
                    ped.dimension = 5;
                    await tryFor(() => ped.handle.should.equal(0));
                    ped.dimension = -1;
                    await tryFor(() => ped.handle.should.not.equal(0));
                });
            });

            it('should calculate distance properly', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    const ppos = player.position;
                    const vpos = ped.position;

                    const distSquared = ped.distSquared(ppos);
                    const dist = ped.dist(ppos);
                    dist.should.be.approximately(Math.sqrt(distSquared), 0.05);
                    distSquared.should.be.approximately((ppos.x - vpos.x) ** 2 + (ppos.y - vpos.y) ** 2 + (ppos.z - vpos.z) ** 2, 1);
                });
            });

            it('should return if position is frozen', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    ped.isPositionFrozen.should.equal(true);
                    ped.freezePosition(false);
                    ped.isPositionFrozen.should.equal(false);
                    ped.freezePosition(true);
                    ped.isPositionFrozen.should.equal(true);
                });
            });

            it('should unstream when out of stream range', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    await tryFor(() => ped.handle.should.not.equal(0));
                    player.setCoordsNoOffset(10000, 10000, 0, false, false, false);
                    await tryFor(() => ped.handle.should.equal(0));
                });
            });

        });
    });
});
