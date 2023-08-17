import { Resource } from "alt-server";
import { readFileSync } from "fs";
import { join } from "path";

export const loadConfig = <T>(path: string): T => {
  return JSON.parse(
    readFileSync(join(Resource.current.path, "configs", path), "utf-8")
  );
};
