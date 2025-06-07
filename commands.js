import CmdSet from "./cmd_set.json" assert { type: "json" };
import { ConsoleError, InternalConsoleError } from "./console_err.js";

/* Action functions */
const printConsole = (str) => {
  console.log(str);
};

/* Add commands here */
const printCmd = (cmd_obj) => {
  const [flags, args] = cmd_obj;
  let content = args.content;
  let times = args?.times ?? 1;

  if (flags.includes("scream")) {
    content = content.toUpperCase();
  } else if (flags.includes("whisper")) {
    content = content.toLowerCase();
  }

  for (let i = 0; i < times; i++) {
    printConsole(content);
  }
};

const helpCmd = (cmd_obj) => {
  if (Object.keys(cmd_obj.args).length > 0) {
    const target = getCmdInfoObj().find((obj) => obj.cmd == cmd_obj.args.name);

    if (!target) {
      throw new ConsoleError("Invalid command argument.");
    }

    if (!target.is_secret) {
      if (target.is_secret) {
        throw new ConsoleError("Invalid command argument.");
      }
    }

    printConsole("Name:\n  " + target.cmd + "\n");
    printConsole("Description:\n  " + target.description + "\n");
    printConsole("Usage:\n  " + target.usage + "\n");
    return;
  }

  printConsole("Available Commands:");
  const cmds = getCmdInfoObj().filter((obj) => !(obj.is_secret ?? false));
  const maxCmdLength = Math.max(...cmds.map((obj) => obj.cmd.length));

  cmds.forEach((obj) => {
    if (obj.is_secret ?? false) return;
    printConsole("  " + obj.cmd.padEnd(maxCmdLength + 3) + obj.usage);
  });

  printConsole(
    "\n\nType 'help <command>' for usage, examples, and option details."
  );
};

const whoCmd = (cmd_obj) => {
  printConsole("Who, me?");
};

/* -- */
const command_set = new Map([
  ["print", printCmd],
  ["help", helpCmd],
  ["who", whoCmd],
]);

export const getCmdInfoObj = () => {
  if (!CmdSet) {
    throw new InternalConsoleError("Console", "Failed to fetch command set.");
  }

  return CmdSet;
};

const findAndRunCmd = (cmd) => {
  if (!command_set.has(cmd.id)) {
    throw new InternalConsoleError(
      "Commands",
      "Command '" + cmd.id + "' not found."
    );
  }

  command_set.get(cmd.id)(cmd);
};

export default findAndRunCmd;
