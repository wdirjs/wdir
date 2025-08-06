import { Command } from "commander";
import { WdirPluginRegisterCommand } from "src/types";

function regiterCommand(
  program: Command,
  watchPath: string,
  { action, description, name, options, aliases }: WdirPluginRegisterCommand
) {
  const cmd = new Command(name).description(description).action(() => {
    action(watchPath, cmd.opts());
  });

  if (aliases) {
    cmd.aliases(aliases);
  }

  for (const { description, flag, defaultValue } of options) {
    cmd.option(flag, description, defaultValue);
  }

  program.addCommand(cmd);
}

export default regiterCommand;
