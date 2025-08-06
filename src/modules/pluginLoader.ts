import fs from "fs";
import path from "path";
import type { WdirPluginAPI } from "../types/wdir";
import type { PluginLoaderConfig, PluginManifest } from "../types/plugin";
import Debugger from "../core/debugger";
import registerCommand from "../utils/registerCommand";

const pluginsDir = path.resolve(__dirname, "../plugins");

async function loadPlugins({
  getWatchPath,
  program,
  version,
  watcher,
  wdirConfig,
}: PluginLoaderConfig) {
  const pluginFolders = fs.readdirSync(pluginsDir);

  for (const folder of pluginFolders) {
    const pluginPath = path.join(pluginsDir, folder);
    const manifestPath = path.join(pluginPath, "src", "manifest.json");
    const entryFile = path.join(pluginPath, "src", "index.js");

    if (!fs.existsSync(manifestPath)) continue;

    const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const pluginName = manifest.name;
    const resolvedLogLevel = manifest.logLevel || wdirConfig.log.level;
    const logger = new Debugger({ ...wdirConfig.log, level: resolvedLogLevel }, pluginName);

    const indexPath = fs.existsSync(entryFile);
    if (!indexPath) continue;

    const pluginModule = await import(entryFile);

    if (typeof pluginModule.default === "function") {
      const api: WdirPluginAPI = {
        program,
        logger,
        watch: watcher,
        config: wdirConfig,
        version,
        path: getWatchPath(),
        registerCommand: (command) => registerCommand(program, getWatchPath(), command),
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
