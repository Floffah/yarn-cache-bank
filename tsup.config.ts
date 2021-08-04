import { Options } from "tsup";

export const tsup: Options = {
    target: "node12",
    splitting: true,
    bundle: true,
    entryPoints: ["src/index.ts", "src/cli.ts"],
    dts: true,
    external: ["*"],
};
