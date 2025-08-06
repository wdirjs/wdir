#!/usr/bin/env node

import { Command } from "commander";
import loadPlugins from "./modules/pluginLoader";
import ConfigLoader from "./modules/configLoader";
import path from "path";
import startWatching, { getWatcher } from "./modules/watcher";
import Debugger from "./core/debugger";

const packageJson = require(path.join(process.cwd(), "package.json")) as {
  name: string;
  description: string;
  version: string;
  [x: string]: any;
};
const config = ConfigLoader.load();
const logger = Debugger.getInstance(config.log);
const watcher = getWatcher();
let currentWatchPath = ".";

logger.info(`Starting ${packageJson.name} v${packageJson.version}`);
logger.debug("Registering commands and loading plugins...");

const program = new Command();
program
  .name(packageJson.name)
  .version(packageJson.version, "-v, --version", "Output the current version")
  .description(packageJson.description)
  .helpOption("-h, --help", "Display help for command")
  .option("-d, --dir <dir>", "Directory to watch", ".");

program.command("*", { hidden: true }).action(() => {
  console.error("Invalid command. Use --help or -h for available commands.");
  process.exit(1);
});

(async () => {
  program.parseOptions(process.argv);
  currentWatchPath = program.opts().dir;

  await loadPlugins({
    program,
    wdirConfig: config,
    watcher,
    version: packageJson.version,
    getWatchPath: () => currentWatchPath,
  });

  startWatching(currentWatchPath);

  program.parse(process.argv);
})();
