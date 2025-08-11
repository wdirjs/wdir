#!/usr/bin/env node

import { Command } from "commander";
import loadPlugins from "./modules/pluginLoader";
import ConfigLoader from "./modules/configLoader";
import path from "path";
import startWatching, { getWatcher } from "./modules/watcher";
import Debugger from "./core/debugger";
import { parseConfig } from "./utils";
import { ConfigKeyValue, ConfigValue, logLevel, outputType } from "./types";

const packageJson = require(path.join(__dirname, "../package.json")) as {
  name: string;
  description: string;
  version: string;
  [x: string]: any;
};
const config = ConfigLoader.load();
const logger = Debugger.getInstance(config.log);
const watcher = getWatcher();
let currentWatchPath = ".";

logger.debug("Registering CORE commands...");

const program = new Command();
program
  .name(packageJson.name)
  .version(packageJson.version, "-v, --version", "Output the current version")
  .description(packageJson.description)
  .helpOption("-h, --help", "Display help for command")
  .option("-d, --dir <dir>", "Directory to watch", ".")
  .option("-c, --config <name>=<value>", "Key-value config", parseConfig, []);

program.addHelpText(
  "after",
  `
Available Configs (--config <name>=<value>):
  - log.level=<${logLevel.join("|")}>       Set level of the log for CORE
  - log.output=<${outputType.join("|")}>                              Set environment
  - log.file=<path>                                        Set path of the log file (optional unless log.output set to file)
  - plugin.active=<boolean>                                Set true or false for plugin activision (by default is true)
  - plugin.path=<path>                                     Set path of the plugins folder (by default is __dirname/../plugins)
`
);

program.command("*", { hidden: true }).action(() => {
  console.error("Invalid command. Use --help or -h for available commands.");
  process.exit(1);
});

logger.debug("CORE commands has been registered...");

(async () => {
  program.parseOptions(process.argv);
  currentWatchPath = program.opts().dir;

  const cliConfigs = program.opts().config as {
    key: ConfigKeyValue;
    value: ConfigValue<ConfigKeyValue>;
  }[];
  if (cliConfigs.length) {
    for (const { key, value } of cliConfigs) {
      try {
        ConfigLoader.overwriteConfig(key, value);
        logger.debug(`Config updated: ${key} = ${JSON.stringify(value)}`);
      } catch (err) {
        logger.error(
          `Failed to update config: ${key} -> ${err instanceof Error ? err.message : String(err)}`
        );
        process.exit(1);
      }
    }

    process.exit();
  }

  logger.debug("Loading plugins...");

  await loadPlugins({
    program,
    wdirConfig: config,
    watcher,
    version: packageJson.version,
    getWatchPath: () => currentWatchPath,
  });

  startWatching(currentWatchPath);

  program.parse(process.argv);
  process.title = `${packageJson.name.toUpperCase()} v${packageJson.version}`;

  logger.info(`Started ${packageJson.name} v${packageJson.version}`);
})();
