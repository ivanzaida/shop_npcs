import {
  LocalPed,
  Player,
  VirtualEntity,
  WorldObject,
  everyTick,
  on,
} from "alt-client";
import { IVector3, Vector3, nextTick } from "alt-shared";
import * as natives from "natives";

const spawnedNpcs = new Map<string, LocalPed>();
const interiorPeds = new Map<number, string>();

const onStreamIn = async (entity: WorldObject): Promise<void> => {
  if (!(entity instanceof VirtualEntity)) {
    return;
  }

  if (entity.getStreamSyncedMeta("groupName") !== "SHOP_NPC") {
    return;
  }
  const id = entity.getStreamSyncedMeta("npcId") as string;

  if (spawnedNpcs.has(id)) {
    return;
  }

  const model = entity.getStreamSyncedMeta("model") as number;
  const rotation = entity.getStreamSyncedMeta("rotation") as IVector3;

  const ped = new LocalPed(model, 0, entity.pos, rotation, false, 0);
  spawnedNpcs.set(id, ped);
  const ent = ped.scriptID;

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
  natives.setPedKeepTask(ent, true);
  natives.setPedCanBeTargetted(ent, false);
  natives.setPedDefaultComponentVariation(ped.scriptID);

  const interior = natives.getInteriorFromEntity(ent);

  nextTick(() => {
    if (ped.scriptID !== 0) {
      interiorPeds.set(interior, id);
    }
  });
};

const onStreamOt = (entity: WorldObject): void => {
  if (!(entity instanceof VirtualEntity)) {
    return;
  }

  if (entity.getStreamSyncedMeta("groupName") !== "SHOP_NPC") {
    return;
  }

  const id = entity.getStreamSyncedMeta("npcId") as string;
  if (!spawnedNpcs.has(id)) {
    return;
  }

  const ped = spawnedNpcs.get(id);

  const interior = natives.getInteriorFromEntity(ped.scriptID);
  ped.destroy();
  spawnedNpcs.delete(id);
  interiorPeds.delete(interior);
};

on("worldObjectStreamIn", onStreamIn);

on("worldObjectStreamOut", onStreamOt);

let oldInterior = undefined;

everyTick(() => {
  const interior = natives.getInteriorFromEntity(Player.local);

  if (oldInterior === interior) {
    return;
  }

  if (!interiorPeds.has(interior)) {
    const ped = spawnedNpcs.get(interiorPeds.get(oldInterior));
    if (ped) {
      natives.playPedAmbientSpeechNative(
        ped.scriptID,
        "GENERIC_BYE",
        "SPEECH_PARAMS_FORCE",
        1
      );
    }
    oldInterior = interior;
    return;
  }

  oldInterior = interior;

  const ped = spawnedNpcs.get(interiorPeds.get(interior));

  if (!ped) {
    return;
  }

  natives.playPedAmbientSpeechNative(
    ped.scriptID,
    "GENERIC_HI",
    "SPEECH_PARAMS_FORCE",
    1
  );
});
