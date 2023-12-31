import * as esbuild from "esbuild";
import process from "process";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "../../build/server.js",
  platform: "neutral",
  target: "ESNext",
  logLevel: "info",
  mainFields: ["main"],
  external: ["alt-shared", "alt-server", "fs", "path"],
});

const shouldWatch = process.argv.includes("--watch");

if (shouldWatch) {
  await context.watch();
} else {
  await context.rebuild();
  process.exit();
}
