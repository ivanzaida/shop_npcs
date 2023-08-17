import * as esbuild from "esbuild";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "../../build/client.js",
  platform: "neutral",
  target: "ESNext",
  logLevel: "info",
  mainFields: ["main"],
  external: ["alt-shared", "alt-client"],
});

const shouldWatch = process.argv.includes("--watch");

if (shouldWatch) {
  await context.watch();
} else {
  await context.rebuild();
  process.exit();
}
