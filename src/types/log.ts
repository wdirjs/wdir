type LogLevel = "silent" | "error" | "warn" | "info" | "debug" | "verbose";
type OutputType = "console" | "file";

interface LoggerConfig {
  /**
   * The minimum log level to output messages.
   * @example "debug" - Outputs all messages including debug, info, warn, and error.
   * @example "warn" - Outputs only warn and error messages.
   * @example "silent" - Suppresses all log messages.
   * @example "error" - Outputs only error messages.
   * @example "info" - Outputs info, warn, and error messages.
   *
   * @default "info"
   */
  level: LogLevel;

  /**
   * The output type for logs.
   * Can be 'console' for standard output, 'file' for writing to a file, or 'json' for structured logging.
   *
   * @default "console"
   */
  output: OutputType;

  /**
   * The file path to write logs if output is set to 'file'.
   * If not specified, logs will not be written to a file.
   */
  file?: string | undefined;

  /**
   * Optional plugin-specific log levels.
   * This allows each plugin to have its own log level configuration.
   * The keys are plugin names and the values are their respective log levels.
   *
   * @example { "minify": "debug", "watcher": "warn" }
   * @default {}
   */
  pluginLevels?: Record<string, LogLevel> | undefined;
}

export type { LogLevel, OutputType, LoggerConfig };
