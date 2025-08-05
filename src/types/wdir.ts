import { Command } from "commander";
import type { LoggerConfig } from "./log";
import type { PluginManifest } from "./plugin";
import Debugger from "../core/debugger";

interface WdirPluginAPI {
  program: Command;
  logger: Debugger;
  watch: {
    on(event: "change" | "add" | "unlink", cb: (file: string) => void): void;
  };
  config: WdirConfig;
  version: string;
  plugin: {
    name: string;
    meta: PluginManifest;
  };
}

interface WdirConfig {
  log: LoggerConfig;
}

export type { WdirPluginAPI, WdirConfig };
