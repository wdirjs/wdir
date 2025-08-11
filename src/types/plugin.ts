import { Command } from "commander";
import type { LogLevel } from "./log";
import type { WdirConfig } from "./wdir";
import type { WdirWatcher } from "./watcher";

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

interface PluginRegisterCommandBase {
  /**
   * The name of the command.
   */
  name: string;

  /**
   * A brief description of the command.
   */
  description: string;

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

type PluginRegisterCommandAnyOption =
  | PluginRegisterCommandOption
  | PluginRegisterCommandOptionWithParser<string>
  | PluginRegisterCommandOptionWithParser<boolean>
  | PluginRegisterCommandOptionWithParser<string[]>;

interface PluginRegisterCommand extends PluginRegisterCommandBase {
  /**
   * An array of option objects, each containing a flag and description.
   */
  options: Array<PluginRegisterCommandAnyOption>;
}

interface PluginRegisterCommandOption {
  /**
   * The flag(s) for the option, in Commander.js format.
   * Examples:
   *  - "-p, --port <number>"
   *  - "-d, --debug"
   *  - "-t, --tags <tag...>"
   */
  flag: string;

  /**
   * A short description of what the option does.
   * Shown automatically in `--help` output.
   */
  description: string;

  /**
   * The default value used if the option is not provided by the user.
   * Must match the `T` or return type of `parser` if used.
   */
  defaultValue?: Array<string> | string | boolean;
}

interface PluginRegisterCommandOptionWithParser<T extends Array<string> | string | boolean> {
  /**
   * The flag(s) for the option, in Commander.js format.
   * Examples:
   *  - "-p, --port <number>"
   *  - "-d, --debug"
   *  - "-t, --tags <tag...>"
   */
  flag: string;

  /**
   * A short description of what the option does.
   * Shown automatically in `--help` output.
   */
  description: string;

  /**
   * The default value used if the option is not provided by the user.
   * Must match the `T` or return type of `parser` if used.
   */
  defaultValue?: T;

  /**
   * A parser function that transforms the raw CLI input (string)
   * into the desired type `T` (string, boolean, or string[]).
   * Runs each time the option appears in the command.
   */
  parser?: (value: string, previous: T) => T;
}

type PluginConfig =
  | {
      active: true;
      path: string;
    }
  | {
      active: false;
      path?: undefined;
    };

export type {
  PluginConfig,
  PluginManifest,
  PluginLoaderConfig,
  WdirPluginMetadata,
  PluginRegisterCommand,
  PluginRegisterCommandOption,
  PluginRegisterCommandOptionWithParser,
};
