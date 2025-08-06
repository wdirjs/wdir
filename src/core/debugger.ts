import chalk from "chalk";
import type { LoggerConfig, LogLevel } from "../types/log";
import ConfigLoader from "../modules/configLoader";

/**
 * Debugger class for logging messages with different levels and outputs.
 */
class Debugger {
  private static CORE_NAME = "CORE";
  private static instance: Debugger;
  private currentContext: string;
  private readonly config: LoggerConfig;

  /**
   * Creates an instance of the Debugger.
   *
   * @param config Logger configuration object.
   */
  private constructor(config: LoggerConfig, context: string = Debugger.CORE_NAME) {
    this.config = {
      ...config,
      pluginLevels: config.pluginLevels ? { ...config.pluginLevels } : undefined,
    };
    this.currentContext = context;
  }

  /**
   * Gets the singleton instance of the Debugger.
   *
   * @param config Logger configuration object.
   * @returns The singleton instance of the Debugger.
   */
  public static getInstance(config: LoggerConfig = ConfigLoader.defaultConfig.log): Debugger {
    if (!Debugger.instance) {
      Debugger.instance = new Debugger(config);
    }

    return Debugger.instance;
  }

  /**
   * Converts a log level string to a number for comparison.
   *
   * @param level The log level to check.
   * @returns A number representing the log level for comparison.
   * Higher numbers indicate more severe log levels (e.g., "silent" is the highest, "debug" is the lowest).
   */
  private levelToNumber(level: LogLevel): number {
    return {
      verbose: 0,
      info: 1,
      debug: 2,
      warn: 3,
      error: 4,
      silent: 5,
    }[level];
  }

  /**
   * Checks if a message should be logged based on the current log level and plugin-specific log level.
   * This is determined by comparing the configured log level with the plugin-specific log level, if any.
   *
   * @param level The log level to check.
   * @returns A boolean indicating whether the message should be logged.
   */
  private shouldLog(level: LogLevel): boolean {
    const effectiveLevel = this.config.pluginLevels?.[this.currentContext] || this.config.level;
    return this.levelToNumber(level) <= this.levelToNumber(effectiveLevel);
  }

  /**
   * Gets the color function for a specific log level.
   *
   * @param level The log level to get the color for.
   * @returns A function that formats the message with the appropriate color based on the log level.
   */
  private getColor(level: LogLevel) {
    return {
      error: chalk.red.bold,
      warn: chalk.yellow,
      info: chalk.cyan,
      debug: chalk.gray,
      verbose: chalk.blueBright,
      silent: (msg: string) => msg,
    }[level];
  }

  /**
   * Logs a message with the specified log level.
   *
   * @param level The log level for the message.
   * @param message The message to log.
   * Logs the message to the console or a file based on the configuration.
   */
  private log(level: LogLevel, message: string) {
    if (!this.shouldLog(level)) return;
    const color = this.getColor(level);
    const tag = chalk.bgMagenta.white(`${this.currentContext}`);
    const formatted = `${color(`[${tag} / ${level.toUpperCase()}]`)} ${message}`;

    if (this.config.output === "console") {
      console.log(formatted);
    } else if (this.config.output === "file" && this.config.file) {
      require("fs").appendFileSync(this.config.file, formatted + "\n");
    }
  }

  /**
   * Creates a new context for logging.
   * This allows for nested logging contexts, useful for plugins or specific operations.
   *
   * @param context The name of the context to create.
   * @returns A new Debugger instance with the context set.
   */
  public createContext(context: string, level?: LogLevel): Debugger {
    const newConfig = {
      ...this.config,
      pluginLevels: {
        ...this.config.pluginLevels,
        ...(level ? { [context]: level } : {}),
      },
    };
    return new Debugger(newConfig, context);
  }

  /**
   * Logs a message at the debug level.
   *
   * @param msg Message to log at the debug level.
   */
  public debug(msg: string) {
    this.log("debug", msg);
  }

  /**
   * Logs a message at the info level.
   *
   * @param msg Message to log at the info level.
   */
  public info(msg: string) {
    this.log("info", msg);
  }

  /**
   * Logs a message at the warn level.
   *
   * @param msg Message to log at the warn level.
   */
  public warn(msg: string) {
    this.log("warn", msg);
  }

  /**
   * Logs a message at the error level.
   *
   * @param msg Message to log at the error level.
   */
  public error(msg: string) {
    this.log("error", msg);
  }
}

export default Debugger;
