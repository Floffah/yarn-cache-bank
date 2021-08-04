import { resolve } from "path";
import {
    existsSync,
    readdirSync,
    readFileSync,
    symlinkSync,
    unlinkSync,
} from "fs";
import chalk from "chalk";
import { homedir } from "os";
import { Config } from "../util/config";
import { parse as jjuParse } from "jju";
import Engine from "../engines/Engine";
import FlatfileEngine from "../engines/FlatfileEngine";

export default async function cacheCommand() {
    const yarnCachePath = resolve(process.cwd(), ".yarn", "cache");
    if (!existsSync(yarnCachePath))
        return console.log(
            chalk`{red X .yarn/cache does not exist in the current context}`,
        );

    const datadir = resolve(homedir(), ".ycb");
    const configpath = resolve(datadir, "config.json");

    if (!existsSync(configpath)) {
        console.log(
            chalk`{red X No yarn-cache-bank config found. Please run 'ycb init' to start}`,
        );
    }

    const config = jjuParse(readFileSync(configpath, "utf-8")) as Config;
    let engine: Engine | undefined;

    switch (config.engine) {
        case "flatfile":
            engine = new FlatfileEngine();
            break;
        default:
            engine = undefined;
    }

    if (!engine)
        return console.log(
            chalk`{red X No valid engine ${config.engine} found}`,
        );

    engine.config = config;
    engine.startCache();

    const logs: ReturnType<typeof console.draft>[] = [];
    let currentLog = 0;

    const logCached = (yarnPath: string, err = false) => {
        if (err)
            return console.log(chalk`{red X Error while caching ${yarnPath}`);

        const draft = logs[currentLog];
        const msg = chalk`{magenta Caching ${yarnPath}}`;

        if (!draft) logs.push(console.draft(msg));
        else draft(msg);

        if (currentLog === 4) currentLog = 0;
        else currentLog++;
    };

    const files = readdirSync(yarnCachePath);

    for (const file of files) {
        if (file.endsWith(".zip")) {
            const absoluteFile = resolve(yarnCachePath, file);
            const didCache = await engine.cachePackage(file, absoluteFile);

            if (didCache === null) logCached(file, true);
            else if (didCache) logCached(file);

            const path = await engine.getPath(file);

            if (path) {
                unlinkSync(absoluteFile);
                symlinkSync(path, absoluteFile);
            }
        }
    }

    engine.finishCache();
}
