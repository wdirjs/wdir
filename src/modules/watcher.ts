import chokidar from "chokidar";
import type { WdirWatcher } from "../types/watcher";

function startWatching(pathToWatch: string, watch: WdirWatcher) {
  const watcher = chokidar.watch(pathToWatch, {
    persistent: true,
  });

  watcher.on("add", (path) => watch.trigger("add", path));
  watcher.on("change", (path) => watch.trigger("change", path));
  watcher.on("unlink", (path) => watch.trigger("unlink", path));
}

export default startWatching;
