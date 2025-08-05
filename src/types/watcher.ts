type WdirWatcherEvent = "change" | "add" | "unlink";

interface WdirWatcher {
  /**
   * Starts watching a specified path for changes.
   *
   * @param event The event type to listen for. Can be "change", "add", or "unlink".
   * @param cb The callback function to execute when the event occurs. It receives the file path as an argument.
   *
   * @example
   * watch.on("change", (file) => {
   *   console.log(`File changed: ${file}`);
   * });
   *
   * @throws {Error} If the event type is not recognized.
   */
  on(event: WdirWatcherEvent, cb: (file: string) => void): void;

  /**
   * Triggers the specified event for the watcher.
   * This method is used internally to notify the watcher of changes.
   * It should not be called directly by plugins or external code.
   *
   * @param event The event type to trigger. Can be "change", "add", or "unlink".
   * @param file The file path associated with the event.
   *
   * @example
   * watch.trigger("change", "/path/to/file.txt");
   */
  trigger(event: WdirWatcherEvent, file: string): void;
}

export type { WdirWatcher };
