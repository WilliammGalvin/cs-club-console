import { InternalConsoleError } from "./console_err.js";

/* Add commands here */
const printCmd = (flags, args) => {
  let content = args.content;
  let times = args?.times ?? 1;

  if (flags.includes("scream")) {
    content = content.toUpperCase();
  } else if (flags.includes("whisper")) {
    content = content.toLowerCase();
  }

  for (let i = 0; i < times && 1; i++) {
    console.log(content);
  }
};

/* -- */
const command_set = new Map([["print", printCmd]]);

const findAndRunCmd = (cmd) => {
  if (!command_set.has(cmd.id)) {
    throw new InternalConsoleError(
      "Commands",
      "Command '" + cmd.id + "' not found."
    );
  }

  command_set.get(cmd.id)(cmd.flags, cmd.args);
};

export default findAndRunCmd;
