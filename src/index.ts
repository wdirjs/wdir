#!/usr/bin/env node

import { Command } from "commander";
import loadPlugins from "./modules/pluginLoader";
import ConfigLoader from "./modules/configLoader";
import path from "path";
import startWatching from "./modules/watcher";
import type { WdirWatcher } from "./types/watcher";

const packageJson = require(path.join(process.cwd(), "package.json")) as {
  name: string;
  description: string;
  version: string;
  [x: string]: any;
};
const config = ConfigLoader.load();

const watchers = {
  change: [] as ((file: string) => void)[],
  add: [] as ((file: string) => void)[],
  unlink: [] as ((file: string) => void)[],
};

const watch: WdirWatcher = {
  on(event: "change" | "add" | "unlink", cb: (file: string) => void) {
    watchers[event].push(cb);
  },
  trigger(event: "change" | "add" | "unlink", file: string) {
    for (const cb of watchers[event]) cb(file);
  },
};

const program = new Command();
program
  .name(packageJson.name)
  .version(packageJson.version, "-v, --version", "Output the current version")
  .description(packageJson.description)
  .argument("[dir]", "Directory to watch", ".")
  .action((dir) => {
    startWatching(dir, watch);
  });

loadPlugins(program, config, watch, packageJson.version).then(() => {
  program.parse(process.argv);
});
