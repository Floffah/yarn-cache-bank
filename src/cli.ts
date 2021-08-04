#!/usr/bin/env node

import { program } from "commander";
import pkg from "../package.json";
import initCommand from "./commands/init";

program
    .version(pkg.version)
    .name("yarn-cache-bank")
    .description(pkg.description);

program
    .command("init")
    .description("Initialise yarn-cache-bank for your environment")
    .action(() => initCommand());

program.parse(process.argv);
