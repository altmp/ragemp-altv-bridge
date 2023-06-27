import {afterAll, afterEach, beforeAll, beforeEach, describe, it, tryFor, waitFor, chai} from 'testlib/index.js';

const should = chai.should;

describe('object', () => {
    describe('server', () => {
        describe('multiple objects', () => {
            const objectCount = 5;
            /** @type {(import('mp-client').mp.Object | import('mp-server').mp.Object)[]} */
            let objects = [];

            beforeEach(async ({server, client, player}) => {
                await server(async ({mp}) => {
                    player.spawn(new mp.Vector3(0, 0, 73));
                    mp.objects.toArray().should.be.empty;
                    for (let i = 0; i < objectCount; i++) {
                        objects.push(mp.objects.new('prop_ecola_can', new mp.Vector3(2, 2, 73), {dimension: player.dimension}));
                    }
                    mp.objects.toArray().should.not.be.empty;
                    mp.objects.toArray().length.should.equal(objectCount);
                    mp.objects.length.should.equal(objectCount);
                });

                await client(async ({mp}) => {
                    await waitFor(() => mp.objects.toArray().length === objectCount);
                    objects = mp.objects.toArray();
                });
            });

            afterEach(async ({server, client, player}) => {
                await server(async ({mp}) => {
                    for (let object of objects) {
                        if (object) object.destroy();
                    }
                    objects = [];
                });

                await client(async ({mp}) => {
                    objects = [];
                });
            });

            it('should create', async ({server, client}) => {
                await server(async ({mp}) => {
                    for (let object of objects) {
                        object.should.exist;
                    }
                });

                await client(async ({mp}) => {
                    for (let object of objects) {
                        object.should.exist;
                        await tryFor(() => object.handle.should.not.equal(0));
                    }
                });
            });

            it('should be accessible by id', async ({server, client, player}) => {
                await server(async ({mp}) => {
                    for (let object of objects) {
                        mp.objects.at(object.id).should.equal(object);
                    }
                });

                await client(async ({mp}) => {
                    for (let object of objects) {
                        mp.objects.at(object.id).should.equal(object);
                    }
                });
            });

            it('should be accessible by remote id', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    for (let object of objects) {
                        mp.objects.atRemoteId(object.remoteId).should.equal(object);
                    }
                });
            });

            it('should be accessible by handle', async ({server, client, player}) => {
                await client(async ({mp}) => {
                    let i = 0;
                    for (let object of objects) {
                        await tryFor(() => object.handle.should.not.equal(0), 10000);
                        mp.objects.atHandle(object.handle).should.equal(object);
                    }
                });
            });
        });

        describe('single object', () => {
            /** @type {import('mp-client').mp.Object | import('mp-server').mp.Object} */
            let object = null;
            beforeEach(async ({server, client, player, params}) => {
                await server(async ({mp}) => {
                    player.spawn(new mp.Vector3(0, 0, 73));
                    player.dimension = 0;
                    mp.objects.toArray().should.be.empty;
                    object = mp.objects.new(params.model ?? 'prop_ecola_can', new mp.Vector3(2, 2, 73), {dimension: player.dimension});
                    mp.objects.toArray().should.not.be.empty;
                    mp.objects.toArray().length.should.equal(1);
                    mp.objects.length.should.equal(1);
                });

                await client(async ({mp}) => {
                    await waitFor(() => mp.objects.toArray().length === 1);
                    object = mp.objects.toArray()[0];
                    await waitFor(() => object.handle !== 0, 10000);
                });
            });

            afterEach(async ({server, client, player}) => {
                await server(async ({mp}) => {
                    if (object) object.destroy();
                    object = null;
                });

                await client(async ({mp}) => {
                    await waitFor(() => mp.objects.toArray().length === 0);
                    object = null;
                });
            });

            it('should return correct type', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.type.should.equal('object');
                });

                await client(async ({mp}) => {
                    object.type.should.equal('object');
                });
            });

            it('should return correct position', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.position = new mp.Vector3(4, 3, 73);
                    object.position.x.should.equal(4);
                    object.position.y.should.equal(3);
                    object.position.z.should.equal(73);
                });
            }, 0);

            it('should sync position', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.position = new mp.Vector3(4, 4, 73);
                });

                await client(async ({mp}) => {
                    await tryFor(() => object.position.x.should.be.approximately(4, 0.5));
                    await tryFor(() => object.position.y.should.be.approximately(4, 0.5));
                });
            });

            it('should return correct model', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.model.should.equal(mp.joaat('prop_ecola_can'));
                    object.model = mp.joaat('prop_el_guitar');
                    object.model.should.equal(mp.joaat('prop_el_guitar'));
                });
            });

            it('should sync model', async ({server, client}) => {
                await client(async ({mp}) => {
                    object.model.should.equal(mp.game.joaat('prop_ecola_can'));
                });

                await server(async ({mp}) => {
                    object.model = mp.joaat('mp_m_freemode_01');
                });

                await client(async ({mp}) => {
                    await tryFor(() => object.getModel().should.equal(mp.game.joaat('mp_m_freemode_01')));
                    await tryFor(() => object.model.should.equal(mp.game.joaat('mp_m_freemode_01')));
                });
            });


            it('should sync data via property', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.data.testInt = 4;
                    object.data.testBool = false;
                    object.data.testString = 'why';
                });

                await client(async ({mp}) => {
                    await tryFor(() => object.getVariable('testInt').should.equal(4));
                    await tryFor(() => object.getVariable('testBool').should.be.false);
                    await tryFor(() => object.getVariable('testString').should.equal('why'));
                });
            });

            it('should sync data via method', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.setVariable('testIntMethod', 2);
                    object.setVariable('testBoolMethod', true);
                    object.setVariable('testStringMethod', 'why2');
                });

                await client(async ({mp}) => {
                    await tryFor(() => object.getVariable('testIntMethod').should.equal(2));
                    await tryFor(() => object.getVariable('testBoolMethod').should.be.true);
                    await tryFor(() => object.getVariable('testStringMethod').should.equal('why2'));
                });
            });

            it('should sync data via batch method', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.setVariables({
                        testIntMethodBatch: 8,
                        testBoolMethodBatch: false,
                        testStringMethodBatch: 'why3'
                    });
                });

                await client(async ({mp}) => {
                    await tryFor(() => object.getVariable('testIntMethodBatch').should.equal(8));
                    await tryFor(() => object.getVariable('testBoolMethodBatch').should.be.false);
                    await tryFor(() => object.getVariable('testStringMethodBatch').should.equal('why3'));
                });
            });

            it('should return data via property', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.setVariable('testIntPropertyGet', 5);
                    object.setVariable('testBoolPropertyGet', false);
                    object.setVariable('testStringPropertyGet', 'lol');
                    object.data.testIntPropertyGet.should.equal(5);
                    object.data.testBoolPropertyGet.should.equal(false);
                    object.data.testStringPropertyGet.should.equal('lol');
                });
            }, 0);

            it('should return data via method', async ({server, client}) => {
                await server(async ({mp}) => {
                    object.setVariable('testIntMethodGet', 5);
                    object.setVariable('testBoolMethodGet', false);
                    object.setVariable('testStringMethodGet', 'lol');
                    object.getVariable('testIntMethodGet').should.equal(5);
                    object.getVariable('testBoolMethodGet').should.equal(false);
                    object.getVariable('testStringMethodGet').should.equal('lol');
                });
            }, 0);
        });

    });
});
