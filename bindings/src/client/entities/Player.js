import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import { Pool } from '../Pool.js';
import { _Entity } from './Entity.js';

export class _Player extends _Entity {
    alt;

    /** @param {alt.Player} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    get handle() {
        return this.alt.scriptID;
    }

    get remoteId() {
        return this.alt.remoteId;
    }

    get position() {
        return new mp.Vector3(this.alt.pos);
    }

    get vehicle() {
        return this.alt.vehicle?.mp ?? null;
    }

    get name() {
        return this.alt.name;
    }

    get model() {
        return this.alt.model;
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

    // TODO: isTypingInTextChat
    // TODO: isPositionFrozen
    // TODO: voiceAutoVolume
    // TODO: voice3d

    // TODO: removeVoiceFx
    // TODO: resetVoiceFx
    // TODO: setVoiceFx*
    
    get type() {
        return 'player';
    }
    
    // #region Natives
    p2pCall() {
        throw new Error('P2P is not supported');
    }

    getPhysicalBoundingBox() {
        return { x: 0, y: 0, z: 0, w: 0 }; // TODO?
    }

    getCurrentScriptedAnim() {
        return 0; // TODO
    }

    getCurrentScenarioId() {
        return 0; // TODO
    }

    // TODO: blips

    // TODO: polyfill client appearance setters

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
        return natives.setEntityAlpha(this.alt, value, skin);
    }

    // TODO: weapon methods

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
        return natives.getEntityHealth(this.alt);
    }

    get isAttachedTo() {
        return this.isAttachedToEntity;
    }

    get hasClearLosTo() {
        return this.hasClearLosToEntity;
    }
    // #endregion
}

Object.defineProperty(alt.Player.prototype, 'mp', { 
    get() {
        return this._mp ??= new _Player(this);
    } 
});

mp.Player = _Player;

mp.players = new Pool(() => alt.Player.all, () => alt.Player.streamedIn, alt.Player.getByID);

mp.players.local = alt.Player.local.mp;

mp.players.atHandle = function(handle) {
    return alt.Player.getByScriptID(handle)?.mp ?? null;
}

alt.onServer('$bridge$dead', (weapon, killer) => {
    mp.events.dispatch('playerDeath', alt.Player.local.mp, weapon, killer?.mp);
});

alt.on('resourceStart', () => {
    mp.events.dispatch('playerJoin', alt.Player.local.mp);
});

alt.on('resourceStop', () => {
    mp.events.dispatch('playerQuit', alt.Player.local.mp);
});

alt.on('connectionComplete', () => {
    mp.events.dispatch('playerReady', alt.Player.local.mp);
});

alt.on('spawned', () => {
    mp.events.dispatch('playerResurrect');
    mp.events.dispatch('playerSpawn', alt.Player.local.mp);
});

alt.on('enteredVehicle', (vehicle, seat) => {
    mp.events.dispatch('playerEnterVehicle', vehicle?.mp, seat);
    mp.events.dispatch('playerStartEnterVehicle', vehicle?.mp, seat);
});

alt.on('leftVehicle', (vehicle, seat) => {
    mp.events.dispatch('playerLeaveVehicle', vehicle?.mp, seat);
});