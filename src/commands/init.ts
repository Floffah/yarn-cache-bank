import { prompt } from "enquirer";
import { resolve } from "path";
import { homedir } from "os";
import { stringify as jjuStringify, parse as jjuParse } from "jju";
import { Cache, Config, defaultConfig } from "../util/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import chalk from "chalk";
import { stringify as flattedStringify } from "flatted";

export default async function initCommand() {
    const datadir = resolve(homedir(), ".ycb");
    const configpath = resolve(datadir, "config.json");

    let config = defaultConfig as Config;

    if (existsSync(configpath)) {
        console.log(
            chalk`{green !} Found existing config. Setting default values to the config's values.`,
        );
        config = { ...config, ...jjuParse(readFileSync(configpath, "utf-8")) };
    }

    const engineChoices = [
        {
            name: "flatfile",
            hint: "- Flat file (recommended, most reliable)",
        },
    ];

    const answers = (await prompt([
        {
            type: "input",
            name: "location",
            required: true,
            message: "Where should the libraries be stored?",
            initial: config.location,
        },
        {
            type: "select",
            name: "engine",
            message: "What engine type should be used?",
            choices: engineChoices,
            initial: engineChoices.findIndex(
                (choice) => choice.name === config.engine,
            ),
        },
    ])) as any;

    if (!existsSync(datadir)) {
        console.log(chalk`{green !} ~/.ycb does not exist. Creating...`);
        mkdirSync(datadir, { recursive: true });
    }
    writeFileSync(
        configpath,
        jjuStringify(
            {
                location: answers.location,
                engine: answers.engine,
            } as Config,
            { mode: "json" },
        ),
    );
    console.log(chalk`{green !} Wrote config`);
    if (!existsSync(resolve(datadir, "cache.json")))
        writeFileSync(
            resolve(datadir, "cache.json"),
            flattedStringify({ cached: [], projects: [] } as Cache),
        );
}
