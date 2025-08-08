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
  const coreLogger = Debugger.getInstance();
  coreLogger.debug("Starting plugin loader...");

  const pluginFolders = fs.readdirSync(pluginsDir);

  for (const folder of pluginFolders) {
    const pluginPath = path.join(pluginsDir, folder);
    const manifestPath = path.join(pluginPath, "src", "manifest.json");

    if (!fs.existsSync(manifestPath)) {
      coreLogger.debug(`Skipping ${folder} - no manifest found!`);
      continue;
    }

    const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const { entry, name: pluginName } = manifest;
    const entryFile = path.join(pluginPath, "src", entry.endsWith(".js") ? entry : entry + ".js");
    const resolvedLogLevel = manifest.logLevel || wdirConfig.log.level;

    const pluginLogger = coreLogger.createContext(pluginName, manifest.logLevel);

    if (!fs.existsSync(entryFile)) {
      pluginLogger.warn(`No entry file found in ${pluginName}`);
      continue;
    }

    try {
      const pluginModule = await import(entryFile);

      if (typeof pluginModule.default === "function") {
        const api: WdirPluginAPI = {
          program,
          logger: pluginLogger,
          watch: watcher,
          config: {
            ...wdirConfig,
            log: {
              ...wdirConfig.log,
              level: wdirConfig.log.pluginLevels?.[pluginName] || resolvedLogLevel,
            },
          },
          version,
          path: getWatchPath(),
          registerCommand: (command) => registerCommand(program, getWatchPath(), command),
          plugin: {
            name: pluginName,
            meta: manifest,
          },
        };

        pluginModule.default(api);
        pluginLogger.info(`Loaded successfully`);
      }
    } catch (error) {
      pluginLogger.error(
        `Failed to load: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  coreLogger.debug(`Loaded ${pluginFolders.length} plugins`);
}

export default loadPlugins;
