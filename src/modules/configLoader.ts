import fs from "fs";
import path from "path";
import type { ConfigKeyValue, ConfigValue, WdirConfig } from "../types/wdir";
import { logLevel, outputType, PluginConfig } from "../types";

/**
 * ConfigLoader is responsible for loading the configuration from a JSON file.
 * It provides a default configuration and validates the loaded configuration.
 */
class ConfigLoader {
  /**
   * Default configuration for the application.
   */
  static readonly defaultConfig: WdirConfig = {
    log: {
      level: "info",
      output: "console",
    },
    plugin: {
      active: true,
      path: path.resolve(__dirname, "../plugins"),
    },
  };

  private static config: WdirConfig | undefined;

  private static configPath = path.join(__dirname, "../wdir.config.json");

  /**
   * Creates a Proxy and ProxyHandler for validating config changes.
   */
  private static createConfigProxy<T extends object>(target: T): T {
    return new Proxy(target, {
      set(obj, prop, value) {
        const propStr = String(prop);

        if (propStr === "log") {
          if (typeof value !== "object") {
            throw new Error(`Config.log must be an object.`);
          }
        }
        if (propStr === "plugin") {
          if (typeof value !== "object") {
            throw new Error(`Config.plugin must be an object.`);
          }
        }
        if (obj === target && propStr === "level") {
          if (!logLevel.includes(value)) {
            throw new Error(`Invalid log.level: ${value}`);
          }
        }
        if (obj === target && propStr === "output") {
          if (!outputType.includes(value)) {
            throw new Error(`Invalid log.output: ${value}`);
          }
        }
        if (obj === target && propStr === "active" && typeof value !== "boolean") {
          throw new Error("plugin.active must be a boolean.");
        }
        if (obj === target && propStr === "path" && typeof value !== "string") {
          throw new Error("plugin.path must be a string.");
        }

        // If assigning an object, wrap it in a proxy for nested validation
        if (typeof value === "object" && value !== null) {
          value = ConfigLoader.createConfigProxy(value);
        }

        obj[prop as keyof typeof obj] = value;
        return true;
      },
      get(obj, prop) {
        const val = obj[prop as keyof typeof obj];
        if (typeof val === "object" && val !== null) {
          return ConfigLoader.createConfigProxy(val);
        }
        return val;
      },
    });
  }

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
      if (this.config) {
        return this.config;
      }

      const config = require(this.configPath) as WdirConfig;

      if (!config.log || typeof config.log !== "object") {
        throw new Error("Invalid configuration: 'log' property is required.");
      }

      if (!config.plugin || typeof config.plugin !== "object") {
        throw new Error("Invalid configuration: 'plugin' property is required.");
      }

      const pluginConfig: PluginConfig = config.plugin.active
        ? { active: true as const, path: config.plugin.path }
        : { active: false as const };
      const wdirConfig: WdirConfig = {
        log: {
          ...this.defaultConfig.log,
          level: config.log.level,
          output: config.log.output,
          file: config.log.file,
        },
        plugin: {
          ...this.defaultConfig.plugin,
          ...pluginConfig,
        } as PluginConfig,
      };

      this.config = this.createConfigProxy(wdirConfig);

      return wdirConfig;
    } catch (error) {
      throw new Error(
        `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Overwrites a nested configuration property using dot notation (e.g., "log.level").
   * - Validates the key and value against the WdirConfig schema.
   * - Uses a Proxy to enforce runtime validation.
   * - Automatically loads the config if not already initialized.
   *
   * @example
   * // Set log.level to "debug"
   * ConfigLoader.overwriteConfig("log.level", "debug");
   *
   * @example
   * // Disable plugins
   * ConfigLoader.overwriteConfig("plugin.active", false);
   *
   * @param key - Dot-notation path to the config property (must match ConfigKeyValue)
   * @param value - New value to set (type-checked against ConfigValue<T>)
   * @throws {Error} If:
   * - The key is invalid (not in WdirConfig)
   * - The value fails validation (e.g., wrong log level)
   * - The config file couldn't be loaded
   */
  static overwriteConfig<T extends ConfigKeyValue>(key: T, value: ConfigValue<T>): void {
    if (!this.config) {
      this.config = this.load();
    }

    const keys: string[] = key!.split(".");
    if (keys.length < 2) {
      throw new Error(`Invalid config key: '${key}'`);
    }

    let current: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const segment = keys[i]!;
      if (!(segment in current)) {
        throw new Error(`Invalid config key: '${keys.slice(0, i + 1).join(".")}' does not exist`);
      }
      current = current[segment];
    }

    const lastKey = keys[keys.length - 1]!;
    current[lastKey] = value;

    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2) + "\n", "utf-8");
  }
}

export default ConfigLoader;
