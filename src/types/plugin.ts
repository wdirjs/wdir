import type { LogLevel } from "./log";

interface PluginManifest {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  logLevel?: LogLevel;
}

export type { PluginManifest };
