import { VirtualEntity, VirtualEntityGroup, log, on } from "alt-server";
import { loadConfig } from "./utils";
import { IVector3, Vector3 } from "alt-shared";

type TNPCConfig = {
  position: IVector3;
  rotation: IVector3;
  id: string;
  model: number;
};

const config = loadConfig<TNPCConfig[]>("npcs.json");

const group = new VirtualEntityGroup(100);

const npcs = config.map((entry) => {
  const entity = new VirtualEntity(
    group,
    new Vector3(entry.position.x, entry.position.y, entry.position.z),
    40,
    {
      model: entry.model,
      npcId: entry.id,
      groupName: "SHOP_NPC",
      rotation: entry.rotation,
    }
  );
  return entity;
});

on("resourceStop", () => {
  npcs.forEach((x) => x.destroy());
});

log("spawned npcs = ", npcs.length);
