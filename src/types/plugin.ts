import { Command } from "commander";
import type { LogLevel } from "./log";
import { WdirConfig } from "./wdir";
import { WdirWatcher } from "./watcher";

interface PluginManifest {
  name: string;
  entry: string;
  description?: string;
  version?: string;
  author?: string;
  logLevel?: LogLevel;
}

interface PluginLoaderConfig {
  getWatchPath: () => string;
  program: Command;
  version: string;
  wdirConfig: WdirConfig;
  watcher: WdirWatcher;
}

interface WdirPluginMetadata {
  name: string;
  meta: PluginManifest;
}

interface WdirPluginRegisterCommand {
  /**
   * The name of the command.
   */
  name: string;

  /**
   * A brief description of the command.
   */
  description: string;

  /**
   * An array of option objects, each containing a flag and description.
   */
  options: Array<{
    flag: string;
    description: string;
    defaultValue?: string | boolean;
  }>;

  /**
   * The action to execute when the command is invoked.
   * It receives a Command instance as an argument.
   */
  action: (dir: string, ...options: any[]) => void;

  /**
   * Optional Aliases for the command.
   */
  aliases?: string[];
}

export type { PluginManifest, PluginLoaderConfig, WdirPluginMetadata, WdirPluginRegisterCommand };
