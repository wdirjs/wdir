import fs from "fs";
import path from "path";
import { Command } from "commander";
import type { WdirConfig, WdirPluginAPI } from "../types/wdir";
import type { PluginManifest } from "../types/plugin";
import Debugger from "../core/debugger";

const pluginsDir = path.resolve(__dirname, "../plugins");

async function loadPlugins(
  program: Command,
  config: WdirConfig,
  watch: WdirPluginAPI["watch"],
  version: string
) {
  const pluginFolders = fs.readdirSync(pluginsDir);

  for (const folder of pluginFolders) {
    const pluginPath = path.join(pluginsDir, folder);
    const manifestPath = path.join(pluginPath, "src", "manifest.json");
    const entryFile = path.join(pluginPath, "src", "index.js");

    if (!fs.existsSync(manifestPath)) continue;

    const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const pluginName = manifest.name;
    const resolvedLogLevel = manifest.logLevel || config.log.level;
    const logger = new Debugger({ ...config.log, level: resolvedLogLevel }, pluginName);

    const indexPath = fs.existsSync(entryFile);
    if (!indexPath) continue;

    const pluginModule = await import(entryFile);

    if (typeof pluginModule.default === "function") {
      const api: WdirPluginAPI = {
        program,
        logger,
        watch,
        config,
        version,
        plugin: {
          name: pluginName,
          meta: manifest,
        },
      };

      pluginModule.default(api);

      logger.info(`Plugin "${pluginName}" loaded successfully.`);
    }
  }
}

export default loadPlugins;
