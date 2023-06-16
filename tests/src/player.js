import {afterAll, afterEach, beforeAll, beforeEach, describe, it, tryFor, waitFor} from 'testlib/index.js';
import {getSyncedData, setSyncedData} from 'testlib/index.js';

describe('player', () => {
    beforeEach(async ({ server, client, player }) => {
        await server(async ({mp}) => {
            player.model = mp.joaat('mp_m_freemode_01');
            player.spawn(new mp.Vector3(0, 0, 73));
        });
    });

    it('should return correct type', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.type.should.equal('player');
        });

        await client(async ({mp}) => {
            player.type.should.equal('player');
        });
    });

    it('should be accessible by id', async ({server, client, player}) => {
        await server(async ({mp}) => {
            mp.players.at(player.id).should.equal(player);
        });

        await client(async ({mp}) => {
            mp.players.at(player.id).should.equal(player);
        });
    });

    it('should be accessible by remote id', async ({server, client, player}) => {
        await client(async ({mp}) => {
            mp.players.atRemoteId(player.remoteId).should.equal(player);
        });
    });

    it('should be accessible by handle', async ({server, client, player}) => {
        await client(async ({mp}) => {
            mp.players.atHandle(player.handle).should.equal(player);
        });
    });

    it('should be accessible by local getter', async ({server, client, player}) => {
        await client(async ({mp}) => {
            mp.players.local.should.equal(player);
        });
    });


    it('should return correct position', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.position = new mp.Vector3(4, 3, 73);
            player.position.x.should.equal(4);
            player.position.y.should.equal(3);
            player.position.z.should.equal(73);
        });
    }, 0);

    it('should sync position', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.position = new mp.Vector3(3, 4, 73);
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getCoords(false).x.should.be.approximately(3, 0.01));
            await tryFor(() => player.getCoords(false).y.should.be.approximately(4, 0.01));
        });
    });

    it('should return correct model', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.model.should.equal(mp.joaat('mp_m_freemode_01'));
            player.model = mp.joaat('mp_f_freemode_01');
            player.model.should.equal(mp.joaat('mp_f_freemode_01'));
        });
    }, 0);

    it('should sync model changes', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.model.should.equal(mp.game.joaat('mp_m_freemode_01'));
        });

        await server(async ({mp}) => {
            player.model = mp.joaat('mp_f_freemode_01');
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getModel().should.equal(mp.game.joaat('mp_f_freemode_01')));
            await tryFor(() => player.model.should.equal(mp.game.joaat('mp_f_freemode_01')));
        });
    });

    it('should sync data via property', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.data.testInt = 4;
            player.data.testBool = false;
            player.data.testString = 'why';
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getVariable('testInt').should.equal(4));
            await tryFor(() => player.getVariable('testBool').should.be.false);
            await tryFor(() => player.getVariable('testString').should.equal('why'));
        });
    });

    it('should sync data via method', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setVariable('testIntMethod', 2);
            player.setVariable('testBoolMethod', true);
            player.setVariable('testStringMethod', 'why2');
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getVariable('testIntMethod').should.equal(2));
            await tryFor(() => player.getVariable('testBoolMethod').should.be.true);
            await tryFor(() => player.getVariable('testStringMethod').should.equal('why2'));
        });
    });

    it('should sync data via batch method', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setVariables({
                testIntMethodBatch: 8,
                testBoolMethodBatch: false,
                testStringMethodBatch: 'why3'
            });
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getVariable('testIntMethodBatch').should.equal(8));
            await tryFor(() => player.getVariable('testBoolMethodBatch').should.be.false);
            await tryFor(() => player.getVariable('testStringMethodBatch').should.equal('why3'));
        });
    });

    it('should return data via property', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setVariable('testIntPropertyGet', 5);
            player.setVariable('testBoolPropertyGet', false);
            player.setVariable('testStringPropertyGet', 'lol');
            player.data.testIntPropertyGet.should.equal(5);
            player.data.testBoolPropertyGet.should.equal(false);
            player.data.testStringPropertyGet.should.equal('lol');
        });
    }, 0);

    it('should return data via method', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setVariable('testIntMethodGet', 5);
            player.setVariable('testBoolMethodGet', false);
            player.setVariable('testStringMethodGet', 'lol');
            player.getVariable('testIntMethodGet').should.equal(5);
            player.getVariable('testBoolMethodGet').should.equal(false);
            player.getVariable('testStringMethodGet').should.equal('lol');
        });
    }, 0);

    it('should return correct alpha', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.alpha = 64;
            player.alpha.should.equal(64);
        });
    }, 0);

    it('should sync alpha', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.alpha = 128;
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getAlpha().should.equal(128));
        });
    });

    it('should return correct dimension', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.dimension = 6;
            player.dimension.should.equal(6);
        });
    }, 0);

    it('should sync dimension', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.dimension = -1;
        });

        await client(async ({mp}) => {
            await tryFor(() => player.dimension.should.equal(-1));
        });
    });

    it('should return voice listeners', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.voiceListeners.should.exist;
            player.voiceListeners.should.satisfy(Array.isArray);
        });
    });

    it('should return streamed players', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.streamedPlayers.should.exist;
            player.streamedPlayers.should.satisfy(Array.isArray);
        });
    });

    it('should return sc name', async ({server, client, player}) => {
        await client(async ({mp}) => {
            await setSyncedData('scname', mp.game.player.getName());
        });

        await server(async ({mp}) => {
            const sc = getSyncedData('scname');
            sc.should.exist;
            player.socialClub.should.equal(sc);
        });
    });

    it('should return ping', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.ping.should.be.a('number');
            player.ping.should.be.greaterThanOrEqual(0);
        });
    });

    it('should return packet loss', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.packetLoss.should.be.a('number');
            player.packetLoss.should.be.greaterThanOrEqual(0);
        });
    });

    it('should return correct name', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.name.should.not.equal('testname');
            player.name = 'testname';
            player.name.should.equal('testname');
        });
    });

    it('should sync name', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.name = 'testname2';
        });

        await client(async ({mp}) => {
            await tryFor(() => player.name.should.equal('testname2'));
        });
    });

    it('should return serial', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.serial.should.exist;
            player.serial.should.be.a('string');
        });
    });

    it('should return ip', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.ip.should.exist;
            player.ip.should.be.a('string');
        });
    });

    it('should return rgsc id', async ({server, client, player}) => {
        await client(async ({mp}) => {
            const id = mp.game.network.playerGetUserid(mp.game.player.id()).userID;
            await setSyncedData('scid', +id);
        });

        await server(async ({mp}) => {
            const id = getSyncedData('scid');
            id.should.be.a('number');
            player.rgscId.should.equal(id);
        });
    });

    it('should return correct health', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.health = 50;
            player.health.should.equal(50);
        });
    });

    it('should sync health', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.health = 29;
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getHealth().should.equal(29));
        });
    });

    it('should sync health from client', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.setHealth(89);
        });

        await server(async ({mp}) => {
            await tryFor(() => player.health.should.equal(89));
        });
    });

    it('should return correct heading', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.heading = 20;
            player.heading.should.equal(20);
        });
    });

    it('should sync heading', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.heading = 80;
        });

        await client(async ({mp}) => {
            player.getHeading().should.equal(80);
        });
    });

    it('should sync heading from client', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.setHeading(30);
        });

        await server(async ({mp}) => {
            await tryFor(() => player.heading.should.equal(30));
        });
    });

    it('should return correct armour', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.armour = 40;
            player.armour.should.equal(40);
        });
    });

    it('should sync armour', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.armour = 59;
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getArmour().should.equal(59));
        });
    });

    it('should sync armour from client', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.setArmour(46);
        });

        await server(async ({mp}) => {
            await tryFor(() => player.armour.should.equal(46));
        });
    });

    it('should return stopped action', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.action.should.equal('stopped');
        });
    });

    it('should calculate distance correctly', async ({server, client, player}) => {
        await server(async ({mp}) => {
            const target = player.position.add(new mp.Vector3(0, 0, 1));

            const distSquared = player.distSquared(target);
            const dist = player.dist(target);
            dist.should.be.approximately(Math.sqrt(distSquared), 0.05);
            dist.should.be.approximately(1, 0.05);
        });
    });

    it('should return correct clothes', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setClothes(1, 5, 0, 2);
            const clothes = player.getClothes(1);
            clothes.drawable.should.equal(5);
            clothes.texture.should.equal(0);
            clothes.palette.should.equal(2);
        });
    });

    it('should sync clothes', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setClothes(1, 1, 1, 1);
        });

        await client(async ({mp}) => {
            player.getDrawableVariation(1).should.equal(1);
            player.getPaletteVariation(1).should.equal(1);
            player.getTextureVariation(1).should.equal(1);
        });
    });

    // decorations are broken in ragemp

    it('should return correct face features', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setFaceFeature(3, -1);
            player.setFaceFeature(4, 1);
            player.getFaceFeature(3).should.equal(-1);
            player.getFaceFeature(4).should.equal(1);
        });
    });

    // face features dont have client side getter

    it('should return correct headblend', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setHeadBlend(0, 1, 2, 3, 4, 5, 0.1, 0.2, 0.3);
            const blend = player.getHeadBlend();
            blend.shapes[0].should.equal(0);
            blend.shapes[1].should.equal(1);
            blend.shapes[2].should.equal(2);
            blend.skins[0].should.equal(3);
            blend.skins[1].should.equal(4);
            blend.skins[2].should.equal(5);
            blend.shapeMix.should.be.approximately(0.1, 0.1);
            blend.skinMix.should.be.approximately(0.2, 0.1);
            blend.thirdMix.should.be.approximately(0.3, 0.1);
        });
    });

    it('should return correct headblend after update', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setHeadBlend(0, 1, 2, 3, 4, 5, 0.1, 0.2, 0.3);
            player.updateHeadBlend(0.3, 0.2, 0.1);
            const blend = player.getHeadBlend();
            blend.shapes[0].should.equal(0);
            blend.shapes[1].should.equal(1);
            blend.shapes[2].should.equal(2);
            blend.skins[0].should.equal(3);
            blend.skins[1].should.equal(4);
            blend.skins[2].should.equal(5);
            blend.shapeMix.should.be.approximately(0.3, 0.1);
            blend.skinMix.should.be.approximately(0.2, 0.1);
            blend.thirdMix.should.be.approximately(0.1, 0.1);
        });
    });

    // memory buffer does not work
    // it('should sync headblend', async ({server, client, player}) => {
    //     await server(async ({mp}) => {
    //         player.setHeadBlend(5, 4, 3, 2, 1, 0, 0.3, 0.2, 0.1);
    //     });
    //
    //     await client(async ({mp, alt, natives}) => await tryFor(() => {
    //         const buf = new alt.MemoryBuffer(36);
    //         natives.getPedHeadBlendData(player.handle, buf);
    //         buf.int(0).should.equal(5);
    //         buf.int(4).should.equal(4);
    //         buf.int(8).should.equal(3);
    //         buf.int(12).should.equal(2);
    //         buf.int(16).should.equal(1);
    //         buf.int(20).should.equal(0);
    //         buf.float(24).should.be.approximately(0.1, 0.1);
    //         buf.float(28).should.be.approximately(0.2, 0.1);
    //         buf.float(32).should.be.approximately(0.3, 0.1);
    //     }));
    // });

    it('should return correct head overlays', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setHeadOverlay(1, [5, 1, 5, 5]);
            player.getHeadOverlay(1).should.eq([5, 1, 5, 5]);
        });
    });

    it('should sync head overlays', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setHeadOverlay(0, [3, 1, 5, 5]);
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getHeadOverlayValue(0).should.equal(3));
        });
    });

    it('should return correct props', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setProp(1, 5, 0);
            const prop = player.getProp(1);
            prop.drawable.should.equal(5);
            prop.texture.should.equal(0);
        });
    });

    it('should sync props', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setProp(1, 8, 0);
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getPropIndex(1).should.equal(8));
            await tryFor(() => player.getPropTextureIndex(1).should.equal(0));
        });
    });

    it('should return correct eye color', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.eyeColor = 5;
            player.eyeColor.should.equal(5);
        });
    });

    it('should sync eye color', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.eyeColor = 3;
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getEyeColor().should.equal(3));
        });
    });

    it('should return correct hair color', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.hairColor = 5;
            player.hairColor.should.equal(5);
        });
    });

    it('should return correct hair highlight color', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.hairHighlightColor = 8;
            player.hairHighlightColor.should.equal(8);
        });
    });

    it('should invoke native', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.invoke('0x44A0870B7E92D7C0', player, 64);
        });

        await client(async ({mp}) => {
            await tryFor(() => mp.game.entity.getAlpha(player.handle).should.equal(64));
        });
    });

    const animDict = 'amb@code_human_cower@female@idle_a';
    const animName = 'idle_d';

    it('should play animation', async ({server, client, player}) => {
        const animDict = 'amb@code_human_cower@female@idle_a';
        const animName = 'idle_d';

        await client(async ({mp}) => {
            player.clearTasksImmediately();
        });

        await server(async ({mp}) => {
            player.playAnimation(animDict, animName, 8, 1);
        });

        await client(async ({mp}) => {
            await tryFor(() => player.isPlayingAnim(animDict, animName, 3).should.be.true);
        });
    });

    it('should return current scripted anim', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.getCurrentScriptedAnim().should.eq([mp.game.joaat(animDict), mp.game.joaat(animName)]);
        });
    });

    it('should stop animation', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.stopAnimation();
        });

        await client(async ({mp}) => {
            await tryFor(() => player.isPlayingAnim(animDict, animName, 3).should.be.false);
        });
    });

    it('should return no scripted anim', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.getCurrentScriptedAnim().should.equal(undefined);
        });
    });

    it('should play scenario', async ({server, client, player}) => {
        const scenName = 'WORLD_HUMAN_PAPARAZZI';

        await client(async () => {
            player.clearTasksImmediately();
        });

        await server(async ({mp}) => {
            player.playScenario(scenName);
        });

        await client(async ({mp}) => {
            await tryFor(() => player.isActiveInScenario().should.be.true);
        });
    });

    it('should return current scenario id', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.getCurrentScenarioId().should.equal(50);
        });
    });

    it('should stop scenario', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.stopAnimation();
        });

        await client(async ({mp}) => {
            await tryFor(() => player.isActiveInScenario().should.be.false);
        });
    });

    it('should return no scenario id', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.getCurrentScenarioId().should.equal(undefined);
        });
    });

    describe(null, () => {
        let vehicle;

        beforeAll(async ({ server, client, player }) => {
            await server(async ({mp}) => {
                mp.vehicles.toArray().should.be.empty;
                vehicle = mp.vehicles.new('t20', player.position, {});
                mp.vehicles.toArray().should.not.be.empty;
                mp.vehicles.length.should.equal(1);
            });
        });

        afterAll(async ({ server, client, player }) => {
            await server(async ({mp}) => {
                if (vehicle) {
                    vehicle.destroy();
                    vehicle = null;
                }
            });
        });

        it('should put into vehicle', async ({server, client, player}) => {
            await server(async ({mp}) => {
                player.putIntoVehicle(vehicle, 0);
            });

            await client(async ({mp}) => {
                await tryFor(() => player.vehicle.should.exist);
                mp.game.vehicle.getPedInSeat(player.vehicle.handle, -1, false).should.equal(player.handle);
            });

            await server(async ({mp}) => {
                await tryFor(() => player.seat.should.equal(0));
            });
        });

        it('should remove from vehicle', async ({server, client, player}) => {
            await server(async ({mp}) => {
                player.vehicle.should.exist;
                player.removeFromVehicle();
            });

            await client(async ({mp}) => {
                await tryFor(() => player.vehicle.should.not.exist);
            });

            await server(async ({mp}) => {
                await tryFor(() => player.vehicle.should.not.exist);
            });
        });
    });

    it('should contain voice methods', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.enableVoiceTo(player);
            player.disableVoiceTo(player);
        });
    });

    it('should return correct weapon ammo amount', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.giveWeapon(mp.joaat('weapon_assaultrifle'), 50);
            await tryFor(() => player.getWeaponAmmo(mp.joaat('weapon_assaultrifle')).should.equal(50));
        });
    });

    it('should return correct weapon ammo amount when set multiple', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.giveWeapon([mp.joaat('weapon_assaultshotgun'), mp.joaat('weapon_heavysniper')], 150);
            await tryFor(() => player.getWeaponAmmo(mp.joaat('weapon_assaultshotgun')).should.equal(150));
            await tryFor(() => player.getWeaponAmmo(mp.joaat('weapon_heavysniper')).should.equal(150));
        });
    });

    it('should sync weapon', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.giveWeapon(mp.joaat('weapon_pistol'), 100);
        });

        await client(async ({mp}) => {
            await tryFor(() => player.hasPedGot(mp.joaat('weapon_pistol'), false).should.be.true);
            await tryFor(() => player.getAmmoInPed(mp.joaat('weapon_pistol')).should.equal(100));
        });
    });

    it('should return current weapon', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.weapon.should.equal(mp.joaat('weapon_pistol'));
        });
    });

    it('should return current weapon ammo', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.weaponAmmo.should.equal(150);
        });
    });

    it('should set overriden value', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.setWeaponAmmo(mp.joaat('weapon_pistol'), 50);
            await tryFor(() => player.weaponAmmo.should.equal(50));
        });

        await client(async ({mp}) => {
            await tryFor(() => player.getAmmoInPed(mp.joaat('weapon_pistol')).should.equal(50));
        });
    });

    it('should remove weapon', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.removeWeapon(mp.joaat('weapon_pistol'));
            await tryFor(() => player.getWeaponAmmo(mp.joaat('weapon_pistol')).should.equal(0));
        });

        await client(async ({mp}) => {
            await tryFor(() => player.hasPedGot(mp.joaat('weapon_pistol'), false).should.be.false);
        });
    });

    it('should remove all weapons', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.removeAllWeapons();
            await tryFor(() => player.getWeaponAmmo(mp.joaat('weapon_assaultrifle')).should.equal(0));
        });

        await client(async ({mp}) => {
            await tryFor(() => player.hasPedGot(mp.joaat('weapon_assaultrifle'), false).should.be.false);
        });
    });

    it('should return all weapons', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.weapons.should.be.an('object');
        });
    });

    it('should return is aiming', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isAiming.should.be.false;
        });
    });

    it('should return is climbing', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isClimbing.should.be.false;
        });
    });

    it('should return is entering vehicle', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isEnteringVehicle.should.be.false;
        });
    });

    it('should return is in cover', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isInCover.should.be.false;
        });
    });

    it('should return is in melee', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isInMelee.should.be.false;
        });
    });

    it('should return is jumping', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isJumping.should.be.false;
        });
    });

    it('should return is leaving vehicle', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isLeavingVehicle.should.be.false;
        });
    });

    it('should return is on ladder', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isOnLadder.should.be.false;
        });
    });

    it('should return is reloading', async ({server, client, player}) => {
        await server(async ({mp}) => {
            player.isReloading.should.be.false;
        });
    });

    it('should sync position from client', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.position = new mp.Vector3(3, 3, 73);
        });

        await server(async ({mp}) => {
            await tryFor(() => player.position.x.should.be.approximately(3, 0.1));
            await tryFor(() => player.position.y.should.be.approximately(3, 0.1));
        });
    });

    it('should sync rotation from client', async ({server, client, player}) => {
        await client(async ({mp}) => {
            player.rotation = new mp.Vector3(0, 0, 90);
        });

        await server(async ({mp}) => {
            player.rotation.z.should.be.approximately(90, 1);
            player.heading.should.be.approximately(90, 1);
        });
    });
});
