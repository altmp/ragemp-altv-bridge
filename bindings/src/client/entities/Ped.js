import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {ClientPool} from '../ClientPool.js';
import {_BaseObject} from './BaseObject.js';
import natives from 'natives';
import {_VirtualEntityBase} from './VirtualEntityBase';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';
import {EntityMixedView} from '../../shared/pools/EntityMixedView';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';
import {VirtualEntityID} from '../../shared/VirtualEntityID';
import {hashIfNeeded, mpDimensionToAlt, toAlt, toMp} from '../../shared/utils';
import {_LocalVehicle} from './Vehicle';
import {_Entity} from './Entity';

const view = EntityGetterView.fromClass(alt.Ped);

export class _Ped extends _Entity {
    /** @param {alt.Ped} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    type = 'ped';

    destroy() {
        if (!this.alt.valid) return;
        if (this.alt.isStreamedIn) this.streamOut(); // TODO: fix in core
        this.alt.destroy();
    }

    get isDynamic() {
        return true;
    }

    //#region Natives
    get giveWeapon() {
        return this.giveToPed; // giveWeaponToPed
    }

    get removeWeapon() {
        return this.removeFromPed; // removeWeaponFromPed
    }

    get removeAllWeapons() {
        return this.removeAllPedS; // removeAllPedWeapons
    }

    get getWeaponAmmo() {
        return this.getAmmoInPed; // getAmmoInPedWeapon
    }

    get setParachuteTaskThrust() {
        return this.setParachuteThrust; // setParachuteTaskThrust
    }

    get taskRappelFromHeli() {
        return this.rappelFromHeli; // taskRappelFromHeli
    }

    get taskJump() {
        return this.jump; // taskJump
    }

    get taskVehiclePark() {
        return this.vehiclePark; // taskVehiclePark
    }

    get taskClearLookAt() {
        return this.clearLookAt; // taskClearLookAt
    }

    get taskVehicleEscort() {
        return this.vehicleEscort; // taskVehicleEscort
    }

    get taskVehicleShootAtPed() {
        return this.vehicleShootAtPed; // taskVehicleShootAtPed
    }

    get taskGoToCoordWhileAimingAtCoord() {
        return this.goToCoordWhileAimingAtCoord; // taskGoToCoordWhileAimingAtCoord
    }

    get taskStartScenarioInPlace() {
        return this.startScenarioInPlace; // taskStartScenarioInPlace
    }

    get taskVehicleDriveToCoordLongrange() {
        return this.vehicleDriveToCoordLongrange; // taskVehicleDriveToCoordLongrange
    }

    get taskBoatMission() {
        return this.boatMission; // taskBoatMission
    }

    get taskFollowNavMeshToCoord() {
        return this.followNavMeshToCoord; // taskFollowNavMeshToCoord
    }

    get clearPedSecondaryTask() {
        return this.clearPedSecondary; // clearPedSecondaryTask
    }

    get taskFollowNavMeshToCoordAdvanced() {
        return this.followNavMeshToCoordAdvanced; // taskFollowNavMeshToCoordAdvanced
    }

    get taskVehicleGotoNavmesh() {
        return this.vehicleGotoNavmesh; // taskVehicleGotoNavmesh
    }

    get taskPutDirectlyIntoMelee() {
        return this.putPedDirectlyIntoMelee; // taskPutPedDirectlyIntoMelee
    }

    get taskGoToCoordAnyMeansExtraParams() {
        return this.goToCoordAnyMeansExtraParams; // taskGoToCoordAnyMeansExtraParams
    }

    get taskTurnToFaceCoord() {
        return this.turnPedToFaceCoord; // taskTurnPedToFaceCoord
    }

    get taskVehicleHeliProtect() {
        return this.vehicleHeliProtect; // taskVehicleHeliProtect
    }

    get setDesiredMoveBlendRatio() {
        return this.setPedDesiredMoveBlendRatio; // setPedDesiredMoveBlendRatio
    }

    get taskSweepAim() {
        return this.sweepAimEntity; // taskSweepAimEntity
    }

    get taskSmartFlee() {
        return this.smartFleePed; // taskSmartFleePed
    }

    get taskPlaneMission() {
        return this.planeMission; // taskPlaneMission
    }

    get pedHasUseScenarioTask() {
        return this.pedHasUseScenario; // pedHasUseScenarioTask
    }

    get isGettingUp() {
        return this.isPedGettingUp; // isPedGettingUp
    }

    get taskPlaneChase() {
        return this.planeChase; // taskPlaneChase
    }

    get taskMoveNetwork() {
        return this.moveNetworkByName; // taskMoveNetworkByName
    }

    get taskDriveBy() {
        return this.driveBy; // taskDriveBy
    }

    get taskFollowToOffsetOf() {
        return this.followToOffsetOfEntity; // taskFollowToOffsetOfEntity
    }

    get taskVehicleFollowWaypointRecording() {
        return this.vehicleFollowWaypointRecording; // taskVehicleFollowWaypointRecording
    }

    get setPathPreferToAvoidWater() {
        return this.setPedPathPreferToAvoidWater; // setPedPathPreferToAvoidWater
    }

    get taskSeekCoverToCoords() {
        return this.seekCoverToCoords; // taskSeekCoverToCoords
    }

    get taskVehicleChase() {
        return this.vehicleChase; // taskVehicleChase
    }

    get isRunningArrestTask() {
        return this.isPedRunningArrest; // isPedRunningArrestTask
    }

    get taskCower() {
        return this.cower; // taskCower
    }

    get taskStopPhoneGestureAnimation() {
        return this.stopPhoneGestureAnimation; // taskStopPhoneGestureAnimation
    }

    get taskPutDirectlyIntoCover() {
        return this.putPedDirectlyIntoCover; // taskPutPedDirectlyIntoCover
    }

    get setPathAvoidFire() {
        return this.setPedPathAvoidFire; // setPedPathAvoidFire
    }

    get taskShockingEventReact() {
        return this.shockingEventReact; // taskShockingEventReact
    }

    get taskShootAtCoord() {
        return this.shootAtCoord; // taskShootAtCoord
    }

    get taskVehicleDriveWander() {
        return this.vehicleDriveWander; // taskVehicleDriveWander
    }

    get taskGuardCurrentPosition() {
        return this.guardCurrentPosition; // taskGuardCurrentPosition
    }

    get taskCombatHatedTargetsInArea() {
        return this.combatHatedTargetsInArea; // taskCombatHatedTargetsInArea
    }

    get taskForceMotionState() {
        return this.forceMotionState; // taskForceMotionState
    }

    get taskLeaveAnyVehicle() {
        return this.leaveAnyVehicle; // taskLeaveAnyVehicle
    }

    get isSprinting() {
        return this.isPedSprinting; // isPedSprinting
    }

    get taskUseNearestScenarioToCoordWarp() {
        return this.useNearestScenarioToCoordWarp; // taskUseNearestScenarioToCoordWarp
    }

    get taskFollowPointRoute() {
        return this.followPointRoute; // taskFollowPointRoute
    }

    get taskSlideToCoordHdgRate() {
        return this.pedSlideToCoordHdgRate; // taskPedSlideToCoordHdgRate
    }

    get taskPerformSequence() {
        return this.performSequence; // taskPerformSequence
    }

    get taskTurnToFace() {
        return this.turnPedToFaceEntity; // taskTurnPedToFaceEntity
    }

    get taskGoToCoordAnyMeans() {
        return this.goToCoordAnyMeans; // taskGoToCoordAnyMeans
    }

    get setDriveTaskCruiseSpeed() {
        return this.setDriveCruiseSpeed; // setDriveTaskCruiseSpeed
    }

    get AddVehicleSubtaskAttackCoord() {
        return this.addVehicleSubAttackCoord; // addVehicleSubtaskAttackCoord
    }

    get taskUseMobilePhoneTimed() {
        return this.useMobilePhoneTimed; // taskUseMobilePhoneTimed
    }

    get taskSkyDive() {
        return this.skyDive; // taskSkyDive
    }

    get taskReloadWeapon() {
        return this.reloadWeapon; // taskReloadWeapon
    }

    get setTaskVehicleChaseIdealPursuitDistance() {
        return this.setVehicleChaseIdealPursuitDistance; // setTaskVehicleChaseIdealPursuitDistance
    }

    get taskAimGunAtCoord() {
        return this.aimGunAtCoord; // taskAimGunAtCoord
    }

    get uncuff() {
        return this.uncuffPed; // uncuffPed
    }

    get taskLookAt() {
        return this.lookAtEntity; // taskLookAtCoord
    }

    get taskReactAndFlee() {
        return this.reactAndFleePed; // taskReactAndFleePed
    }

    get isCuffed() {
        return this.isPedCuffed; // isPedCuffed
    }

    get setPathCanUseLadders() {
        return this.setPedPathCanUseLadders; // setPedPathCanUseLadders
    }

    get getScriptTaskStatus() {
        return this.getScriptStatus; // getScriptTaskStatus
    }

    get taskAimGunScripted() {
        return this.aimGunScripted; // taskAimGunScripted
    }

    get taskShuffleToNextVehicleSeat() {
        return this.shuffleToNextVehicleSeat; // taskShuffleToNextVehicleSeat
    }

    get taskCombatHatedTargetsAround() {
        return this.combatHatedTargetsAroundPed; // taskCombatHatedTargetsAroundPed
    }

    get taskPlayAnimAdvanced() {
        return this.playAnimAdvanced; // taskPlayAnimAdvanced
    }

    get taskSeekCoverFrom() {
        return this.seekCoverFromPos; // taskSeekCoverFromPos
    }

    get getDesiredMoveBlendRatio() {
        return this.getPedDesiredMoveBlendRatio; // getPedDesiredMoveBlendRatio
    }

    get AddVehicleSubtaskAttack() {
        return this.addVehicleSubAttackCoord; // addVehicleSubtaskAttackCoord
    }

    get isDrivebyTaskUnderneathDrivingTask() {
        return this.isDrivebyUnderneathDrivingTask; // isDrivebyTaskUnderneathDrivingTask
    }

    get taskClimb() {
        return this.climb; // taskClimb
    }

    get taskChatTo() {
        return this.chatToPed; // taskChatToPed
    }

    get setHighFallTask() {
        return this.setHighFall; // setHighFallTask
    }

    get setPathCanUseClimbovers() {
        return this.setPedPathCanUseClimbovers; // setPedPathCanUseClimbovers
    }

    get taskPlayPhoneGestureAnimation() {
        return this.playPhoneGestureAnimation; // taskPlayPhoneGestureAnimation
    }

    get isBeingArrested() {
        return this.isPedBeingArrested; // isPedBeingArrested
    }

    get taskSetBlockingOfNonTemporaryEvents() {
        return this.setBlockingOfNonTemporaryEvents; // taskSetBlockingOfNonTemporaryEvents
    }

    get taskStandStill() {
        return this.standStill; // taskStandStill
    }

    get taskAchieveHeading() {
        return this.achieveHeading; // taskAchieveHeading
    }

    get taskVehicleMissionTarget() {
        return this.vehicleMissionPedTarget; // taskVehicleMissionPedTarget
    }

    get taskSmartFleeCoord() {
        return this.smartFleeCoord; // taskSmartFleeCoord
    }

    get taskOpenVehicleDoor() {
        return this.openVehicleDoor; // taskOpenVehicleDoor
    }

    get taskPlantBomb() {
        return this.plantBomb; // taskPlantBomb
    }

    get updateTaskAimGunScriptedTarget() {
        return this.updateAimGunScriptedTarget; // updateTaskAimGunScriptedTarget
    }

    get taskGoToWhileAimingAt() {
        return this.goToCoordWhileAimingAtCoord; // taskGoToCoordWhileAimingAtCoord
    }

    get stopAnimTask() {
        return this.stopAnim; // stopAnimTask
    }

    get taskWarpIntoVehicle() {
        return this.warpPedIntoVehicle; // taskWarpPedIntoVehicle
    }

    get taskAimGunAt() {
        return this.aimGunAtEntity; // taskAimGunAtEntity
    }

    get taskGetOffBoat() {
        return this.getOffBoat; // taskGetOffBoat
    }

    get taskSwapWeapon() {
        return this.swapWeapon; // taskSwapWeapon
    }

    get isMountedWeaponTaskUnderneathDrivingTask() {
        return this.isMountedWeaponUnderneathDrivingTask; // isMountedWeaponTaskUnderneathDrivingTask
    }

    get taskGoToCoordAndAimAtHatedEntitiesNearCoord() {
        return this.goToCoordAndAimAtHatedEntitiesNearCoord; // taskGoToCoordAndAimAtHatedEntitiesNearCoord
    }

    get updateTaskHandsUpDuration() {
        return this.updateHandsUpDuration; // updateTaskHandsUpDuration
    }

    get taskGotoAiming() {
        return this.gotoEntityAiming; // taskGotoEntityAiming
    }

    get isActiveInScenario() {
        return this.isPedActiveInScenario; // isPedActiveInScenario
    }

    get taskStealthKill() {
        return this.stealthKill; // taskStealthKill
    }

    get clearTasksImmediately() {
        return this.clearPedTasksImmediately; // clearPedTasksImmediately
    }

    get isStill() {
        return this.isPedStill; // isPedStill
    }

    get taskHeliChase() {
        return this.heliChase; // taskHeliChase
    }

    get taskStandGuard() {
        return this.standGuard; // taskStandGuard
    }

    get getIsTaskActive() {
        return this.getIsActive; // getIsTaskActive
    }

    get taskParachuteToTarget() {
        return this.parachuteToTarget; // taskParachuteToTarget
    }

    get taskClimbLadder() {
        return this.climbLadder; // taskClimbLadder
    }

    get taskGoToCoordAnyMeansExtraParamsWithCruiseSpeed() {
        return this.goToCoordAnyMeansExtraParamsWithCruiseSpeed; // taskGoToCoordAnyMeansExtraParamsWithCruiseSpeed
    }

    get taskWanderStandard() {
        return this.wanderStandard; // taskWanderStandard
    }

    get taskUseMobilePhone() {
        return this.useMobilePhone; // taskUseMobilePhone
    }

    get taskPatrol() {
        return this.patrol; // taskPatrol
    }

    get taskPlaneLand() {
        return this.planeLand; // taskPlaneLand
    }

    get taskEnterVehicle() {
        return this.enterVehicle; // taskEnterVehicle
    }

    get setParachuteTaskTarget() {
        return this.setParachuteTarget; // setParachuteTaskTarget
    }

    get clearDrivebyTaskUnderneathDrivingTask() {
        return this.clearDrivebyUnderneathDrivingTask; // clearDrivebyTaskUnderneathDrivingTask
    }

    get taskVehicleTempAction() {
        return this.vehicleTempAction; // taskVehicleTempAction
    }

    get isRunning() {
        return this.isPedRunning; // isPedRunning
    }

    get taskGuardSphereDefensiveArea() {
        return this.guardSphereDefensiveArea; // taskGuardSphereDefensiveArea
    }

    get setTaskVehicleChaseBehaviorFlag() {
        return this.setVehicleChaseBehaviorFlag; // setTaskVehicleChaseBehaviorFlag
    }

    get taskWrithe() {
        return this.writhe; // taskWrithe
    }

    get taskSlideToCoord() {
        return this.pedSlideToCoord; // taskPedSlideToCoord
    }

    get taskParachute() {
        return this.parachute; // taskParachute
    }

    get taskLeaveVehicle() {
        return this.leaveVehicle; // taskLeaveVehicle
    }

    get taskMoveNetworkAdvanced() {
        return this.moveNetworkAdvancedByName; // taskMoveNetworkAdvancedByName
    }

    get taskGoStraightToCoord() {
        return this.goStraightToCoord; // taskGoStraightToCoord
    }

    get setDriveTaskDrivingStyle() {
        return this.setDriveDrivingStyle; // setDriveTaskDrivingStyle
    }

    get taskHeliMission() {
        return this.heliMission; // taskHeliMission
    }

    get isWalking() {
        return this.isPedWalking; // isPedWalking
    }

    get isInWrithe() {
        return this.isPedInWrithe; // isPedInWrithe
    }

    get taskWanderInArea() {
        return this.wanderInArea; // taskWanderInArea
    }

    get clearTasks() {
        return this.clearPedS; // clearPedTasks
    }

    get taskVehicleDriveToCoord() {
        return this.vehicleDriveToCoord; // taskVehicleDriveToCoord
    }

    get setPathCanDropFromHeight() {
        return this.setPedPathCanDropFromHeight; // setPedPathCanDropFromHeight
    }

    get taskGotoEntityOffset() {
        return this.gotoEntityOffset; // taskGotoEntityOffset
    }

    get taskVehicleAimAt() {
        return this.vehicleAimAtPed; // taskVehicleAimAtPed
    }

    get isStrafing() {
        return this.isPedStrafing; // isPedStrafing
    }

    get updateTaskSweepAimEntity() {
        return this.updateSweepAimEntity; // updateTaskSweepAimEntity
    }

    get taskStayInCover() {
        return this.stayInCover; // taskStayInCover
    }

    get taskPause() {
        return this.pause; // taskPause
    }

    get taskPlayAnim() {
        return this.playAnim; // taskPlayAnim
    }

    get taskSetDecisionMaker() {
        return this.setDecisionMaker; // taskSetDecisionMaker
    }

    get taskSynchronizedScene() {
        return this.synchronizedScene; // taskSynchronizedScene
    }

    get taskVehicleMissionCoorsTarget() {
        return this.vehicleMissionCoorsTarget; // taskVehicleMissionCoorsTarget
    }

    get taskCombat() {
        return this.combatPed; // taskCombatPed
    }

    get taskHandsUp() {
        return this.handsUp; // taskHandsUp
    }

    get taskArrest() {
        return this.arrestPed; // taskArrestPed
    }

    get taskStartScenarioAtPosition() {
        return this.startScenarioAtPosition; // taskStartScenarioAtPosition
    }

    get taskVehicleFollow() {
        return this.vehicleFollow; // taskVehicleFollow
    }

    get ExplodeHead() {
        return this.explodeHead; // explodePedHead
    }

    get HideBloodDamageByZone() {
        return this.hideBloodDamageByZone; // hidePedBloodDamageByZone
    }

    get isHeadtracking() {
        return this.isHeadtrackingPed; // isPedHeadtrackingPed
    }

    get hasClearLosToInFront() {
        return this.hasClearLosToEntityInFront; // hasEntityClearLosToEntityInFront
    }

    get isAMission() {
        return this.isAMissionEntity; // isEntityAMissionEntity
    }

    get isTouching() {
        return this.isTouchingEntity; // isEntityTouchingEntity
    }

    get attachTo() {
        return this.attachToEntity; // attachEntityToEntity
    }

    get isAt() {
        return this.isAtCoord; // isEntityAtCoord
    }

    get setNoCollision() {
        return this.setNoCollisionEntity; // setEntityNoCollisionEntity
    }

    get clearLastDamage() {
        return this.clearLastDamageEntity; // clearEntityLastDamageEntity
    }

    get setAsMission() {
        return this.setAsMissionEntity; // setEntityAsMissionEntity
    }

    get attachToPhysically() {
        return this.attachToEntityPhysically; // attachEntityToEntityPhysically
    }

    get hasBeenDamagedBy() {
        return this.hasBeenDamagedByEntity; // hasEntityBeenDamagedByEntity
    }

    get isAttachedTo() {
        return this.isAttachedToEntity; // isEntityAttachedToEntity
    }

    get hasClearLosTo() {
        return this.hasClearLosToEntity; // hasEntityClearLosToEntity
    }

    get setWeaponAmmo() {
        return this.setPedAmmo;
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
        return this.requestPedVehicleVisibilityTracking;
    }

    get registerheadshot() {
        return this.registerPedheadshot;
    }

    get setFacialDecoration() {
        return this.addDecorationFromHashesInCorona;
    }

    get setDecoration() {
        return this.addDecorationFromHashes;
    }

    getVehicleIsUsing() {
        return natives.getVehiclePedIsUsing(this.handle);
    }

    getVehicleIsTryingToEnter() {
        return natives.getVehiclePedIsTryingToEnter(this.handle);
    }

    unregisterheadshot() {
        return natives.unregisterPedheadshot(this.handle);
    }

    getVehicleIsIn(includeEntering) {
        return natives.getVehiclePedIsIn(this.handle, includeEntering);
    }

    get getsJacker() {
        return this.getPedsJacker;
    }

    get setResetRagdollFlag() {
        return this.clearRagdollBlockingFlags;
    }

    get clearFacialDecorations() {
        return this.clearDecorationsLeaveScars;
    }

    get getRelationshipBetweens() {
        return this.getRelationshipBetweenS;
    }

    setExclusivePhoneRelationships() {
        return natives.getVehiclePedIsEntering(this.handle);
    }

    getVehicleIndexFromIndex(entity) {
        return natives.getVehicleIndexFromEntityIndex(entity);
    }

    get setCoords2() {
        return this.setCoordsWithoutPlantsReset;
    }

    get isCollisonDisabled() {
        return this.getCollisionDisabled;
    }

    getObjectIndexFromIndex() {
        return natives.getObjectIndexFromEntityIndex(this.handle);
    }


    getHealth() {
        const value = natives.getEntityHealth(this.alt) - 100;
        return Math.max(value, 0);
    }

    setHealth(value) {
        natives.setEntityHealth(this.alt, value <= 0 ? 99 : (value + 100));
    }
    //#endregion
}

export class _LocalPed extends _Ped {
    /** @param {alt.LocalPed} alt */
    constructor(alt) {
        super(alt);
        this.alt = alt;
    }

    destroy() {
        if (!this.alt.valid) return;
        this.alt.destroy();
    }

    get remoteId() {
        return 65535;
    }

    getVariable(key) {
        if (!this.hasVariable(key)) return undefined;
        return toMp(this.alt.getMeta(key));
    }

    setVariable(key, value) {
        this.alt.setMeta(key, toAlt(value));
    }

    hasVariable(key) {
        return this.alt.hasMeta(key);
    }
}


Object.defineProperty(alt.Ped.prototype, 'mp', {
    get() {
        return this._mp ??= new _Ped(this);
    }
});

Object.defineProperty(alt.LocalPed.prototype, 'mp', {
    get() {
        return this._mp ??= new _LocalPed(this);
    }
});

mp.Ped = _Ped;

mp.peds = new ClientPool(view);

mp.peds.new = function (model, position, heading = 0, dimension = 0) {
    model = hashIfNeeded(model);
    if (!natives.isModelValid(model)) {
        console.warn('Tried to spawn ped with invalid model:', model);
        model = alt.hash('ig_amandatownley');
    }
    const ent = new alt.LocalPed(model, mpDimensionToAlt(dimension), new alt.Vector3(position), new alt.Vector3(0, 0, heading).toRadians(), true, mp.streamingDistance);
    ent.pos = new alt.Vector3(position);
    return ent.mp;
};

alt.on('worldObjectStreamIn', (ent) => {
    if (ent?.mp instanceof _LocalPed) {
        natives.setEntityInvincible(ent, true);
        natives.disablePedPainAudio(ent, true);
        natives.freezeEntityPosition(ent, true);
        natives.taskSetBlockingOfNonTemporaryEvents(ent, true);
        natives.setBlockingOfNonTemporaryEvents(ent, true);
        natives.setPedFleeAttributes(ent, 0, false);
        natives.setPedDefaultComponentVariation(ent);
        natives.setPedNeverLeavesGroup(ent, true);
        natives.setCanAttackFriendly(ent, false, false);
        natives.setPedCombatAbility(ent, 100);
        natives.setPedCombatMovement(ent, 3);
        natives.setPedConfigFlag(ent, 32, false);
        natives.setPedConfigFlag(ent, 281, true);
        natives.setPedCombatAttributes(ent, 0, false);
        natives.setPedCombatAttributes(ent, 1, false);
        natives.setPedCombatAttributes(ent, 2, false);
        natives.setPedCombatAttributes(ent, 3, false);
        natives.setPedCombatAttributes(ent, 20, false);
        natives.setPedCombatAttributes(ent, 292, true);
        natives.setPedCombatRange(ent, 2);
        natives.blockAllSpeechFromPed(ent, true, true);
        natives.setPedKeepTask(ent, true);
        natives.setEntityAsMissionEntity(ent, true, false);
        natives.setPedCanRagdoll(ent, false);
        natives.setPedSeeingRange(ent, 0);
        natives.setPedCanBeTargetted(ent, false);
        natives.setPedCanBeKnockedOffVehicle(ent, 1);
        natives.setPedCanBeDraggedOut(ent, false);
        natives.setPedSuffersCriticalHits(ent, false);
        natives.setPedDropsWeaponsWhenDead(ent, false);
        natives.setPedDiesInstantlyInWater(ent, false);
        natives.setPedDiesWhenInjured(ent, false);
        natives.setPedGetOutUpsideDownVehicle(ent, false);
        natives.setPedCanEvasiveDive(ent, false);
    }
});
