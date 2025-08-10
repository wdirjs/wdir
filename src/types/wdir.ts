import { Command } from "commander";
import type { LoggerConfig } from "./log";
import type { PluginConfig, WdirPluginMetadata, WdirPluginRegisterCommand } from "./plugin";
import Debugger from "../core/debugger";
import type { WdirWatcher } from "./watcher";

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
  plugin: PluginConfig;
}

type ConfigKeyValue = {
  [K in keyof WdirConfig]: {
    [P in keyof WdirConfig[K]]: `${K}.${P & string}`;
  }[keyof WdirConfig[K]];
}[keyof WdirConfig];

type ConfigValue<T extends ConfigKeyValue> = T extends `log.level`
  ? WdirConfig["log"]["level"]
  : T extends `log.output`
  ? WdirConfig["log"]["output"]
  : T extends `log.file`
  ? string
  : T extends `plugin.active`
  ? boolean
  : T extends `plugin.path`
  ? string
  : never;

export type { ConfigKeyValue, ConfigValue, WdirPluginAPI, WdirConfig };
