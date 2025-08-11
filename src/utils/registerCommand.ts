import { Command } from "commander";
import type { PluginRegisterCommand } from "../types";

function registerCommand<T extends Array<string> | string | boolean>(
  program: Command,
  watchPath: string,
  { action, description, name, options, aliases }: PluginRegisterCommand
) {
  const cmd = new Command(name).description(description).action(() => {
    action(watchPath, cmd.opts());
  });

  if (aliases) {
    cmd.aliases(aliases);
  }

  for (const option of options) {
    if ("parser" in option && typeof option.parser === "function") {
      if (Array.isArray(option.defaultValue)) {
        cmd.option(
          option.flag,
          option.description,
          option.parser as (value: string, previous: string[]) => string[],
          option.defaultValue
        );
      } else if (typeof option.defaultValue === "boolean") {
        cmd.option(
          option.flag,
          option.description,
          option.parser as (value: string, previous: boolean) => boolean,
          option.defaultValue
        );
      } else {
        cmd.option(
          option.flag,
          option.description,
          option.parser as (value: string, previous: string) => string,
          option.defaultValue
        );
      }
    } else {
      cmd.option(option.flag, option.description, option.defaultValue);
    }
  }

  program.addCommand(cmd);
}

export default registerCommand;
