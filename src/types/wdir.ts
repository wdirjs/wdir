import { Command } from "commander";
import type { LoggerConfig } from "./log";
import type { WdirPluginMetadata, WdirPluginRegisterCommand } from "./plugin";
import Debugger from "../core/debugger";
import { WdirWatcher } from "./watcher";

interface WdirPluginAPI {
  program: Command;
  logger: Debugger;
  watch: { on: WdirWatcher["on"] };
  config: WdirConfig;
  version: string;
  path: string;
  plugin: WdirPluginMetadata;
  registerCommand: (command: WdirPluginRegisterCommand) => void;
}

interface WdirConfig {
  log: LoggerConfig;
}

export type { WdirPluginAPI, WdirConfig };
