#!/usr/bin/env node

import { program } from "commander";
import pkg from "../package.json";
import initCommand from "./commands/init";
import cacheCommand from "./commands/cache";
import draftlog from "draftlog";

draftlog(console);

program
    .version(pkg.version)
    .name("yarn-cache-bank")
    .description(pkg.description);

program
    .command("init")
    .description("Initialise yarn-cache-bank for your environment")
    .action(() => initCommand());

program
    .command("cache")
    .description(
        "Fix symlinks and cache all uncached packages in your current project",
    )
    .action(() => cacheCommand());

program.parse(process.argv);
