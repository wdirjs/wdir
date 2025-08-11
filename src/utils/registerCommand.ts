import { Command } from "commander";
import { WdirPluginRegisterCommand } from "../types/plugin";

function registerCommand<T extends Array<string> | string | boolean>(
  program: Command,
  watchPath: string,
  { action, description, name, options, aliases }: WdirPluginRegisterCommand<T>
) {
  const cmd = new Command(name).description(description).action(() => {
    action(watchPath, cmd.opts());
  });

  if (aliases) {
    cmd.aliases(aliases);
  }

  for (const { description, flag, defaultValue, parser } of options) {
    parser
      ? cmd.option(flag, description, parser, defaultValue)
      : cmd.option(flag, description, defaultValue);
  }

  program.addCommand(cmd);
}

export default registerCommand;
