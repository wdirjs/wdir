import chokidar from "chokidar";
import type { WdirWatcher } from "../types/watcher";
import Debugger from "../core/debugger";

const watchers = {
  change: [] as ((file: string) => void)[],
  add: [] as ((file: string) => void)[],
  unlink: [] as ((file: string) => void)[],
};

const watch: WdirWatcher = {
  on(event: "change" | "add" | "unlink", cb: (file: string) => void) {
    watchers[event].push(cb);
  },
  trigger(event: "change" | "add" | "unlink", file: string) {
    for (const cb of watchers[event]) cb(file);
  },
};

function startWatching(pathToWatch: string) {
  const logger = Debugger.getInstance();
  logger.info(`Starting watcher on path: ${pathToWatch}`);

  const watcher = chokidar.watch(pathToWatch, {
    persistent: true,
  });

  watcher.on("add", (path) => {
    watch.trigger("add", path);
    logger.debug(`File added: ${path}`);
  });
  watcher.on("change", (path) => {
    watch.trigger("change", path);
    logger.debug(`File changed: ${path}`);
  });
  watcher.on("unlink", (path) => {
    watch.trigger("unlink", path);
    logger.debug(`File unlinked: ${path}`);
  });

  logger.info(`Watching started on: ${pathToWatch}`);
}

function getWatcher(): WdirWatcher {
  return watch;
}

export { getWatcher };
export default startWatching;
