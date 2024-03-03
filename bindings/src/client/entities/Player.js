import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import {ClientPool} from '../ClientPool.js';
import {_Entity} from './Entity.js';
import {altSeatToMp, getOverlayColorType, internalName, toMp} from '../../shared/utils';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {emitServerInternal} from '../clientUtils';
import {BaseObjectType} from '../../shared/BaseObjectType';

export class _Player extends _Entity {
    /** @type {import('alt-client').Player} */
    alt;

    /** @param {alt.Player} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    getVariable(key) {
        if (!this.alt.valid) return undefined;
        if (this.alt === alt.Player.local && alt.hasLocalMeta(key)) return toMp(alt.getLocalMeta(key));
        return super.getVariable(key);
    }

    get position() {
        if (!this.alt.valid) return mp.Vector3.zero;
        return new mp.Vector3(this.alt.pos);
    }

    set position(value) {
        if (this.alt !== alt.Player.local) return;
        this.alt.pos = value;
    }

    get rotation() {
        return new mp.Vector3(this.alt.rot.toDegrees());
    }

    set rotation(value) {
        if (this.alt !== alt.Player.local) return;
        this.alt.rot = new alt.Vector3(value).toRadians();
    }

    get vehicle() {
        if (this.alt.vehicle?.mp) return this.alt.vehicle.mp;
        const veh = natives.isPedInAnyVehicle(this.handle, false)
            ? natives.getVehiclePedIsIn(this.alt, false)
            : 0;
        if (veh) return mp.vehicles.atHandle(veh);
        return null;
    }

    get name() {
        return this.alt.name;
    }

    set name(value) {
        // TODO
    }

    get weapon() {
        return this.alt.currentWeapon;
    }

    set weapon(value) {
        natives.setCurrentPedWeapon(this.alt, value, true);
    }

    get model() {
        return this.alt.model;
    }

    set model(value) {
        throw new Error('Setting player.model is not supported. Use player.setModelAsync instead');
    }

    async setModelAsync(value) {
        if (alt.Player.local !== this.alt) return;
        const scriptID = this.handle;
        emitServerInternal('setModel', value);
        await alt.Utils.waitFor(() => this.handle !== scriptID);
    }

    get voiceVolume() {
        return this.alt.spatialVolume; // TODO: what to do with non spatial volume?
    }

    set voiceVolume(value) {
        this.alt.spatialVolume = value;
        this.alt.nonSpatialVolume = value;
    }

    get isPlayerTalking() {
        return this.alt.isTalking;
    }

    get isVoiceActive() {
        return this.alt.isTalking;
    }

    // TODO: isTypingInTextChat
    get isTypingInTextChat() {
        return false;
    }

    voiceAutoVolume = false;
    voice3d = false;

    removeVoiceFx() {
        console.warn('Voice methods are not supported');
    }

    resetVoiceFx() {
        console.warn('Voice methods are not supported');
    }

    setVoiceFx() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxBQF() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxChorus() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxCompressor() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxDistortion() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxEcho() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxFlanger() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxGargle() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxI3DL2Reverb() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxParamEq() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxPeakEq() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxReverb() {
		console.warn('Voice methods are not supported');
	}

    setVoiceFxVolume() {
		console.warn('Voice methods are not supported');
	}

    giveWeapon() {
        console.warn('Client-side weapon setters are not supported');
    }

    type = 'player';

    // #region Natives
    p2pCall() {
        throw new Error('P2P is not supported');
    }

    getPhysicalBoundingBox() {
        return { x: 0, y: 0, z: 0, w: 0 }; // TODO?
    }

    getCurrentScriptedAnim() {
        return undefined; // TODO
    }

    getCurrentScenarioId() {
        return undefined; // TODO
    }

    // TODO: blips

    setFaceFeature(index, feature) {
        natives.setPedMicroMorph(this.alt, index, feature);
    }

    setHeadOverlay(overlayId, index, opacity, color1, color2) {
        natives.setPedHeadOverlay(this.alt, overlayId, index, opacity);
        if (color1 != null && color2 != null)  {
            natives.setPedHeadOverlayTint(this.alt, overlayId, getOverlayColorType(overlayId), color1, color2);
        }
    }

    setHeadOverlayColor(...arr) {
        natives.setPedHeadOverlayTint(this.alt, ...arr);
    }

    setComponentVariation(...arr) {
        natives.setPedComponentVariation(this.alt, ...arr);
    }

    setHairColor(...arr) {
        natives.setPedHairTint(this.alt, ...arr);
    }

    setEyeColor(...arr) {
        natives.setHeadBlendEyeColor(this.alt, ...arr);
    }

    setDefaultComponentVariation() {
        natives.setPedDefaultComponentVariation(this.alt);
    }

    getAlpha() {
        return natives.getEntityAlpha(this.alt);
    }

    getModel() {
        return natives.getEntityModel(this.alt);
    }

    getVelocity() {
        return new mp.Vector3(natives.getEntityVelocity(this.alt));
    }

    setAlpha(value, skin) {
        if (value === 255) return natives.resetEntityAlpha(this.alt);
        return natives.setEntityAlpha(this.alt, value, skin);
    }

    get setParachuteTaskThrust() {
        return this.setParachuteThrust;
    }

    get taskRappelFromHeli() {
        return this.rappelFromHeli;
    }

    get taskJump() {
        return this.jump;
    }

    get taskVehiclePark() {
        return this.vehiclePark;
    }

    get taskClearLookAt() {
        return this.clearLookAt;
    }

    get taskVehicleEscort() {
        return this.vehicleEscort;
    }

    get taskGoToCoordWhileAimingAtCoord() {
        return this.goToCoordWhileAimingAtCoord;
    }

    get taskStartScenarioInPlace() {
        return this.startScenarioInPlace;
    }

    get taskVehicleDriveToCoordLongrange() {
        return this.vehicleDriveToCoordLongrange;
    }

    get taskBoatMission() {
        return this.boatMission;
    }

    get taskFollowNavMeshToCoord() {
        return this.followNavMeshToCoord;
    }

    get taskFollowNavMeshToCoordAdvanced() {
        return this.followNavMeshToCoordAdvanced;
    }

    get taskVehicleGotoNavmesh() {
        return this.vehicleGotoNavmesh;
    }

    get taskPutDirectlyIntoMelee() {
        return this.putPedDirectlyIntoMelee;
    }

    get taskGoToCoordAnyMeansExtraParams() {
        return this.goToCoordAnyMeansExtraParams;
    }

    get taskTurnToFaceCoord() {
        return this.turnPedToFaceCoord;
    }

    get taskVehicleHeliProtect() {
        return this.vehicleHeliProtect;
    }

    get setDesiredMoveBlendRatio() {
        return this.setPedDesiredMoveBlendRatio;
    }

    get taskSmartFlee() {
        return this.smartFleePed;
    }

    get taskPlaneMission() {
        return this.planeMission;
    }

    get isGettingUp() {
        return this.isPedGettingUp;
    }

    get taskPlaneChase() {
        return this.planeChase;
    }

    get taskDriveBy() {
        return this.driveBy;
    }

    get taskVehicleFollowWaypointRecording() {
        return this.vehicleFollowWaypointRecording;
    }

    get setPathPreferToAvoidWater() {
        return this.setPedPathPreferToAvoidWater;
    }

    get taskSeekCoverToCoords() {
        return this.seekCoverToCoords;
    }

    get taskVehicleChase() {
        return this.vehicleChase;
    }

    get isRunningArrestTask() {
        return this.isPedRunningArrest;
    }

    get taskCower() {
        return this.cower;
    }

    get taskStopPhoneGestureAnimation() {
        return this.stopPhoneGestureAnimation;
    }

    get taskPutDirectlyIntoCover() {
        return this.putPedDirectlyIntoCover;
    }

    get setPathAvoidFire() {
        return this.setPedPathAvoidFire;
    }

    get taskShockingEventReact() {
        return this.shockingEventReact;
    }

    get taskShootAtCoord() {
        return this.shootAtCoord;
    }

    get taskVehicleDriveWander() {
        return this.vehicleDriveWander;
    }

    get taskGuardCurrentPosition() {
        return this.guardCurrentPosition;
    }

    get taskCombatHatedTargetsInArea() {
        return this.combatHatedTargetsInArea;
    }

    get taskForceMotionState() {
        return this.forceMotionState;
    }

    get taskLeaveAnyVehicle() {
        return this.leaveAnyVehicle;
    }

    get isSprinting() {
        return this.isPedSprinting;
    }

    get taskUseNearestScenarioToCoordWarp() {
        return this.useNearestScenarioToCoordWarp;
    }

    get taskFollowPointRoute() {
        return this.followPointRoute;
    }

    get taskSlideToCoordHdgRate() {
        return this.pedSlideToCoordHdgRate;
    }

    get taskPerformSequence() {
        return this.performSequence;
    }

    get taskGoToCoordAnyMeans() {
        return this.goToCoordAnyMeans;
    }

    get setDriveTaskCruiseSpeed() {
        return this.setDriveCruiseSpeed;
    }

    get AddVehicleSubtaskAttackCoord() {
        return this.addVehicleSubAttackCoord;
    }

    get taskUseMobilePhoneTimed() {
        return this.useMobilePhoneTimed;
    }

    get taskSkyDive() {
        return this.skyDive;
    }

    get taskReloadWeapon() {
        return this.reloadWeapon;
    }

    get setTaskVehicleChaseIdealPursuitDistance() {
        return this.setVehicleChaseIdealPursuitDistance;
    }

    get taskAimGunAtCoord() {
        return this.aimGunAtCoord;
    }

    get uncuff() {
        return this.uncuffPed;
    }

    get taskReactAndFlee() {
        return this.reactAndFleePed;
    }

    get isCuffed() {
        return this.isPedCuffed;
    }

    get setPathCanUseLadders() {
        return this.setPedPathCanUseLadders;
    }

    get getScriptTaskStatus() {
        return this.getScriptStatus;
    }

    get taskAimGunScripted() {
        return this.aimGunScripted;
    }

    get taskShuffleToNextVehicleSeat() {
        return this.shuffleToNextVehicleSeat;
    }

    get taskCombatHatedTargetsAround() {
        return this.combatHatedTargetsAroundPed;
    }

    get taskPlayAnimAdvanced() {
        return this.playAnimAdvanced;
    }

    get taskSeekCoverFrom() {
        return this.seekCoverFromPed;
    }

    get getDesiredMoveBlendRatio() {
        return this.getPedDesiredMoveBlendRatio;
    }

    get AddVehicleSubtaskAttack() {
        return this.addVehicleSubAttackPed;
    }

    get isDrivebyTaskUnderneathDrivingTask() {
        return this.isDrivebyUnderneathDrivingTask;
    }

    get taskClimb() {
        return this.climb;
    }

    get taskChatTo() {
        return this.chatToPed;
    }

    get setHighFallTask() {
        return this.setHighFall;
    }

    get setPathCanUseClimbovers() {
        return this.setPedPathCanUseClimbovers;
    }

    get taskPlayPhoneGestureAnimation() {
        return this.playPhoneGestureAnimation;
    }

    get isBeingArrested() {
        return this.isPedBeingArrested;
    }

    get taskSetBlockingOfNonTemporaryEvents() {
        return this.setBlockingOfNonTemporaryEvents;
    }

    get taskStandStill() {
        return this.standStill;
    }

    get taskAchieveHeading() {
        return this.achieveHeading;
    }

    get taskVehicleMissionTarget() {
        return this.vehicleMissionPedTarget;
    }

    get taskSmartFleeCoord() {
        return this.smartFleeCoord;
    }

    get taskOpenVehicleDoor() {
        return this.openVehicleDoor;
    }

    get taskPlantBomb() {
        return this.plantBomb;
    }

    get updateTaskAimGunScriptedTarget() {
        return this.updateAimGunScriptedTarget;
    }

    get stopAnimTask() {
        return this.stopAnim;
    }

    get taskWarpIntoVehicle() {
        return this.warpPedIntoVehicle;
    }

    get taskGetOffBoat() {
        return this.getOffBoat;
    }

    get taskSwapWeapon() {
        return this.swapWeapon;
    }

    get isMountedWeaponTaskUnderneathDrivingTask() {
        return this.isMountedWeaponUnderneathDrivingTask;
    }

    get taskGoToCoordAndAimAtHatedEntitiesNearCoord() {
        return this.goToCoordAndAimAtHatedEntitiesNearCoord;
    }

    get updateTaskHandsUpDuration() {
        return this.updateHandsUpDuration;
    }

    get isActiveInScenario() {
        return this.isPedActiveInScenario;
    }

    get taskStealthKill() {
        return this.stealthKill;
    }

    get isStill() {
        return this.isPedStill;
    }

    get taskHeliChase() {
        return this.heliChase;
    }

    get taskStandGuard() {
        return this.standGuard;
    }

    get getIsTaskActive() {
        return this.getIsActive;
    }

    get taskParachuteToTarget() {
        return this.parachuteToTarget;
    }

    get taskClimbLadder() {
        return this.climbLadder;
    }

    get taskGoToCoordAnyMeansExtraParamsWithCruiseSpeed() {
        return this.goToCoordAnyMeansExtraParamsWithCruiseSpeed;
    }

    get taskWanderStandard() {
        return this.wanderStandard;
    }

    get taskUseMobilePhone() {
        return this.useMobilePhone;
    }

    get taskPatrol() {
        return this.patrol;
    }

    get taskPlaneLand() {
        return this.planeLand;
    }

    get taskEnterVehicle() {
        return this.enterVehicle;
    }

    get setParachuteTaskTarget() {
        return this.setParachuteTarget;
    }

    get clearDrivebyTaskUnderneathDrivingTask() {
        return this.clearDrivebyUnderneathDrivingTask;
    }

    get taskVehicleTempAction() {
        return this.vehicleTempAction;
    }

    get isRunning() {
        return this.isPedRunning;
    }

    get taskGuardSphereDefensiveArea() {
        return this.guardSphereDefensiveArea;
    }

    get setTaskVehicleChaseBehaviorFlag() {
        return this.setVehicleChaseBehaviorFlag;
    }

    get taskWrithe() {
        return this.writhe;
    }

    get taskSlideToCoord() {
        return this.pedSlideToCoord;
    }

    get taskParachute() {
        return this.parachute;
    }

    get taskLeaveVehicle() {
        return this.leaveVehicle;
    }

    get taskGoStraightToCoord() {
        return this.goStraightToCoord;
    }

    get setDriveTaskDrivingStyle() {
        return this.setDriveDrivingStyle;
    }

    get taskHeliMission() {
        return this.heliMission;
    }

    get isWalking() {
        return this.isPedWalking;
    }

    get isInWrithe() {
        return this.isPedInWrithe;
    }

    get taskWanderInArea() {
        return this.wanderInArea;
    }

    get clearTasks() {
        return this.clearPedS;
    }

    get taskVehicleDriveToCoord() {
        return this.vehicleDriveToCoord;
    }

    get setPathCanDropFromHeight() {
        return this.setPedPathCanDropFromHeight;
    }

    get taskGotoEntityOffset() {
        return this.gotoEntityOffset;
    }

    get taskVehicleAimAt() {
        return this.vehicleAimAtPed;
    }

    get isStrafing() {
        return this.isPedStrafing;
    }

    get updateTaskSweepAimEntity() {
        return this.updateSweepAimEntity;
    }

    get taskStayInCover() {
        return this.stayInCover;
    }

    get taskPause() {
        return this.pause;
    }

    get taskPlayAnim() {
        return this.playAnim;
    }

    get taskSetDecisionMaker() {
        return this.setDecisionMaker;
    }

    get taskSynchronizedScene() {
        return this.synchronizedScene;
    }

    get taskVehicleMissionCoorsTarget() {
        return this.vehicleMissionCoorsTarget;
    }

    get taskCombat() {
        return this.combatPed;
    }

    get taskHandsUp() {
        return this.handsUp;
    }

    get taskArrest() {
        return this.arrestPed;
    }

    get taskStartScenarioAtPosition() {
        return this.startScenarioAtPosition;
    }

    get taskVehicleFollow() {
        return this.vehicleFollow;
    }

    get ExplodeHead() {
        return this.explodeHead;
    }

    get registerheadshot() {
        return this.registerHeadshot;
    }

    get HideBloodDamageByZone() {
        return this.hideBloodDamageByZone;
    }

    get isHeadtracking() {
        return this.isHeadtrackingPed;
    }

    get getsJacker() {
        return this.getPedsJacker;
    }

    get getRelationshipBetweens() {
        return this.getRelationshipBetweenS;
    }

    get clearLastDamage() {
        return this.clearPedLastDamage;
    }

    get hasBeenDamagedBy() {
        return this.hasPedBeenDamagedBy;
    }

    get taskVehicleShootAtPed() {
        return this.vehicleShootAtPed;
    }

    get clearPedSecondaryTask() {
        return this.clearPedSecondary;
    }

    get taskSweepAim() {
        return this.sweepAimEntity;
    }

    get pedHasUseScenarioTask() {
        return this.pedHasUseScenario;
    }

    get taskMoveNetwork() {
        return this.moveNetworkByName;
    }

    get taskFollowToOffsetOf() {
        return this.followToOffsetOfEntity;
    }

    get taskTurnToFace() {
        return this.turnPedToFaceEntity;
    }

    get taskLookAt() {
        return this.lookAtEntity;
    }

    get taskGoToWhileAimingAt() {
        return this.goToEntityWhileAimingAtEntity;
    }

    get taskAimGunAt() {
        return this.aimGunAtEntity;
    }

    get taskGotoAiming() {
        return this.gotoEntityAiming;
    }

    get clearTasksImmediately() {
        return this.clearPedTasksImmediately;
    }

    get taskMoveNetworkAdvanced() {
        return this.moveNetworkAdvancedByName;
    }

    get setPathsWidthPlant() {
        return this.setPedPathMayEnterWater;
    }

    get setRagdollFlag() {
        return this.setRagdollBlockingFlags;
    }

    get isPropValid() {
        return this.setPreloadPropData;
    }

    get getFloodInvincibility() {
        return this.requestVehicleVisibilityTracking;
    }

    get setFacialDecoration() {
        return this.addDecorationFromHashesInCorona;
    }

    get setDecoration() {
        return this.addDecorationFromHashes;
    }

    getVehicleIsUsing() {
        return natives.getVehiclePedIsUsing(this.alt);
    }

    getVehicleIsTryingToEnter() {
        return natives.getVehiclePedIsTryingToEnter(this.alt);
    }

    unregisterheadshot() {
        return natives.unregisterPedheadshot(this.alt);
    }

    getVehiclePedIsIn(includeLastVehicle) {
        return natives.getVehiclePedIsIn(this.alt, includeLastVehicle);
    }

    get setResetRagdollFlag() {
        return this.clearRagdollBlockingFlags;
    }

    get clearFacialDecorations() {
        return this.clearDecorationsLeaveScars;
    }

    setExclusivePhoneRelationships() {
        return natives.getVehiclePedIsEntering(this.alt);
    }

    get hasClearLosToInFront() {
        return this.hasClearLosToEntityInFront;
    }

    get isAMission() {
        return this.isAMissionEntity;
    }

    get isTouching() {
        return this.isTouchingEntity;
    }

    getVehicleIndexFromIndex(entity) {
        return natives.getVehicleIndexFromEntityIndex(entity);
    }

    get setCoords2() {
        return this.setCoordsWithoutPlantsReset;
    }

    get attachTo() {
        return this.attachToEntity;
    }

    get isAt() {
        return this.isAtEntity;
    }

    get setNoCollision() {
        return this.setNoCollisionEntity;
    }

    get setAsMission() {
        return this.setAsMissionEntity;
    }

    get attachToPhysically() {
        return this.attachToEntityPhysically;
    }

    get isCollisionDisabled() {
        return this.getCollisionDisabled;
    }

    getObjectIndexFromIndex() {
        return natives.getObjectIndexFromEntityIndex(this.alt);
    }

    getHealth() {
        const value = natives.getEntityHealth(this.handle) - 100;
        return Math.max(value, 0);
    }

    setHealth(value) {
        natives.setEntityHealth(this.handle, value, 0, 0);
    }

    get isAttachedTo() {
        return this.isAttachedToEntity;
    }

    get hasClearLosTo() {
        return this.hasClearLosToEntity;
    }

    getVehicleIsIn(includeEntering) {
        return natives.getVehiclePedIsIn(this.handle, includeEntering);
    }
    // #endregion
}

Object.defineProperty(alt.Player.prototype, 'mp', {
    get() {
        return this._mp ??= new _Player(this);
    }
});

mp.Player = _Player;

const view = EntityGetterView.fromClass(alt.Player, [BaseObjectType.Player, BaseObjectType.LocalPlayer]);
view.streamRangeGetter = () => [alt.Player.local, ...alt.Player.streamedIn];

mp.players = new ClientPool(view, [_Player]);

mp.players.local = alt.Player.local.mp;

alt.on('streamSyncedMetaChange', (player, key, newValue) => {
    if (!(player instanceof alt.Player)) return;
    if (key === (internalName('alpha'))) {
        if (newValue === 255) {
            natives.resetEntityAlpha(player);
        } else {
            natives.setEntityAlpha(player, newValue, false);
        }
    }
});

alt.on('gameEntityCreate', (player) => {
    if (!(player instanceof alt.Player)) return;
    alt.nextTick(() => {
        if (!player.valid || player.scriptID === 0) return;
        if (player.hasStreamSyncedMeta(internalName('alpha'))) {
            const value = player.getStreamSyncedMeta(internalName('alpha'));
            if (value === 255) {
                natives.resetEntityAlpha(player);
            } else {
                natives.setEntityAlpha(player, value, false);
            }
        }
    });
});

alt.onServer(internalName('dead'), (weapon, killer) => {
    mp.notifyTrace('player', 'player death ', weapon, killer);
    mp.events.dispatchLocal('playerDeath', alt.Player.local.mp, weapon, toMp(killer));
});

alt.onServer(internalName('join'), (player) => {
    if (player === alt.Player.local) return;
    mp.events.dispatchLocal('playerJoin', toMp(player));
});

alt.onServer(internalName('quit'), (player) => {
    if (player === alt.Player.local) return;
    mp.events.dispatchLocal('playerQuit', toMp(player));
});

alt.on('resourceStart', () => {
    mp.events.dispatchLocal('playerJoin', alt.Player.local.mp);
});

alt.on('resourceStop', () => {
    mp.events.dispatchLocal('playerQuit', alt.Player.local.mp);
});

alt.on('connectionComplete', () => {
    mp.events.dispatchLocal('playerReady', alt.Player.local.mp);
});

alt.on('spawned', () => {
    mp.notifyTrace('player', 'player spawned');
    mp.events.dispatchLocal('playerResurrect');
    mp.events.dispatchLocal('playerSpawn', alt.Player.local.mp);
});

function getSeat() {
    if (!natives.isPedInAnyVehicle(alt.Player.local, false)) return -1;
    const veh = natives.getVehiclePedIsIn(alt.Player.local, false);
    const seats = natives.getVehicleModelNumberOfSeats(natives.getEntityModel(veh));
    for(let i = -1; i <= seats - 2; i++) {
        if (natives.getPedInVehicleSeat(veh, i, false) !== alt.Player.local.scriptID) continue;
        return i + 1;
    }
}

if (mp._main) {
    let lastVehicle = mp.players.local.vehicle;
    let lastSeat = getSeat();
    setInterval(() => {
        const newVehicle = mp.players.local.vehicle;
        if (newVehicle !== lastVehicle) {
            console.log('Changed vehicle from ' + lastVehicle?.id + ' to ' + newVehicle?.id);
            mp.notifyTrace('player', 'player changed vehicle from', lastVehicle, 'to', newVehicle);
            if (lastVehicle) {
                mp.events.dispatchLocal('playerLeaveVehicle', lastVehicle?.alt?.valid ? lastVehicle : null, lastSeat);
            }

            if (newVehicle) {
                const newSeat = getSeat();
                mp.events.dispatchLocal('playerStartEnterVehicle', newVehicle, newSeat);
                mp.events.dispatchLocal('playerEnterVehicle', newVehicle, newSeat);
                lastSeat = newSeat;
            }

            lastVehicle = newVehicle;
        } else if (lastVehicle) {
            const newSeat = getSeat();
            if (newSeat !== lastSeat) {
                console.log('Changed vehicle seat from ' + lastSeat + ' to ' + newSeat);
                mp.events.dispatchLocal('playerEnterVehicle', newVehicle, newSeat);
                lastSeat = newSeat;
            }
        }
    }, 500);
}

alt.on('netOwnerChange', (ent, newOwner, oldOwner) => {
    mp.events.dispatchLocal('entityControllerChange', ent, toMp(newOwner));
});

alt.onServer(internalName('notify'), message => {
    mp.game.graphics.notify(message);
});

alt.on('spawned', () => {
    natives.setPedConfigFlag(alt.Player.local.scriptID, 184, true);
});

alt.on('playerWeaponShoot', () => {
    mp.events.dispatchLocal('playerWeaponShot', new mp.Vector3(0, 0, 0), null); // TODO: get target data from core
});

const boneMap = {0:1,1:2,2:3,3:4,4:14,5:15,6:16,7:36,8:38,9:0,10:97,11:39,12:40,13:41,14:42,15:68,16:69,17:70,18:71,19:97,20:98};
alt.on('weaponDamage', (target, weapon, damage, offset, bodyPart, sourceEntity) => {
    mp.events.dispatchLocal('outgoingDamage', sourceEntity?.mp ?? alt.Player.local.mp, target?.mp, alt.Player.local.mp, weapon, boneMap[bodyPart] || 0, damage);
});

alt.on('playerStartTalking', (player) => {
    mp.events.dispatchLocal('playerStartTalking', player.mp);
});

alt.on('playerStopTalking', (player) => {
    mp.events.dispatchLocal('playerStopTalking', player.mp);
});
