import path from "path";
import type { WdirConfig } from "../types/wdir";

/**
 * ConfigLoader is responsible for loading the configuration from a JSON file.
 * It provides a default configuration and validates the loaded configuration.
 */
class ConfigLoader {
  /**
   * Default configuration for the application.
   */
  static defaultConfig: WdirConfig = {
    log: {
      level: "info",
      output: "console",
    },
  };

  private static config: WdirConfig | undefined;

  /**
   * Loads the configuration from the `wdir.config.json` file.
   * * If the file does not exist or is invalid, it returns the default configuration.
   * 
   * @returns The loaded configuration object.
   * 
   * @throws Will throw an error if the configuration file cannot be loaded or is invalid.
   */
  static load(): WdirConfig {
    try {
      if (ConfigLoader.config) {
        return ConfigLoader.config;
      }

      const config = require(path.resolve("src/wdir.config.json")) as WdirConfig;

      if (!config.log || typeof config.log !== "object") {
        throw new Error("Invalid configuration: 'log' property is required.");
      }

      const logConfig: WdirConfig = {
        log: {
          level: config.log.level || "info",
          output: config.log.output || "console",
          file: config.log.file,
        },
      };

      ConfigLoader.config = logConfig;

      return logConfig;
    } catch (error) {
      throw new Error(
        `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export default ConfigLoader;
