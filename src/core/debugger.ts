import chalk from "chalk";
import type { LoggerConfig, LogLevel } from "../types/log";

/**
 * Debugger class for logging messages with different levels and outputs.
 */
class Debugger {
  /**
   * Creates an instance of the Debugger.
   *
   * @param config Logger configuration object.
   * @param pluginName Name of the plugin for which the logger is being created.
   * @default "If not provided, defaults to 'CORE'".
   */
  constructor(private config: LoggerConfig, private pluginName: string = "CORE") {}

  /**
   * Converts a log level string to a number for comparison.
   *
   * @param level The log level to check.
   * @returns A number representing the log level for comparison.
   * Higher numbers indicate more severe log levels (e.g., "silent" is the highest, "debug" is the lowest).
   */
  private levelToNumber(level: LogLevel): number {
    return { silent: 5, error: 4, warn: 3, info: 2, debug: 1 }[level];
  }

  /**
   * Checks if a message should be logged based on the current log level and plugin-specific log level.
   * This is determined by comparing the configured log level with the plugin-specific log level, if any.
   *
   * @param level The log level to check.
   * @returns A boolean indicating whether the message should be logged.
   */
  private shouldLog(level: LogLevel): boolean {
    const pluginLevel = this.config.pluginLevels?.[this.pluginName] || this.config.level;
    return this.levelToNumber(level) >= this.levelToNumber(pluginLevel);
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
    const tag = chalk.bgMagenta.white(`${this.pluginName}`);
    const formatted = `${color(`[${tag} / ${level.toUpperCase()}]`)} ${message}`;

    if (this.config.output === "console") {
      console.log(formatted);
    } else if (this.config.output === "file" && this.config.file) {
      require("fs").appendFileSync(this.config.file, formatted + "\n");
    }
  }

  /**
   * Logs a message at the debug level.
   * 
   * @param msg Message to log at the debug level.
   */
  debug(msg: string) {
    this.log("debug", msg);
  }

  /**
   * Logs a message at the info level.
   * 
   * @param msg Message to log at the info level.
   */
  info(msg: string) {
    this.log("info", msg);
  }

  /**
   * Logs a message at the warn level.
   * 
   * @param msg Message to log at the warn level.
   */
  warn(msg: string) {
    this.log("warn", msg);
  }

  /**
   * Logs a message at the error level.
   * 
   * @param msg Message to log at the error level.
   */
  error(msg: string) {
    this.log("error", msg);
  }
}

export default Debugger;
