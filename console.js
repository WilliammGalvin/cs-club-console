import Lexer, { TokenType } from "./lexer.js";
import CmdSet from "./cmd_set.json" assert { type: "json" };
import { ConsoleError, InternalConsoleError } from "./console_err.js";
import findAndRunCmd from "./commands.js";

class Console {
  constructor(tokens) {
    this.tokens = tokens;
    this._index = 0;
  }

  /* Helper functions */
  #isAtEnd(pos = 0) {
    return this._index + pos >= this.tokens.length;
  }

  #peek(pos = 0) {
    if (this.#isAtEnd(pos)) {
      throw new InternalConsoleError(
        "Console",
        "Attempting to peek out of bounds."
      );
    }

    return this.tokens[this._index + pos];
  }

  #consume() {
    if (this.#isAtEnd()) {
      throw new InternalConsoleError(
        "Console",
        "Attempting to consume out of bounds."
      );
    }

    return this.tokens[this._index++];
  }

  /* -- */
  #parseFlags() {
    let flags = [];

    while (!this.#isAtEnd()) {
      if (
        this.#peek().type != TokenType.LONG_FLAG &&
        this.#peek().type != TokenType.SHORT_FLAG
      )
        break;

      flags.push(this.#consume().content);
    }

    return flags;
  }

  #validateFlags(flags, flagOptions) {
    let long_flags = [];

    flags.forEach((flag) => {
      let flag_found = false;

      flagOptions.forEach((f_option) => {
        if (f_option.long == flag || f_option.short == flag) {
          flag_found = true;

          if (!long_flags.includes(f_option.long)) {
            long_flags.push(f_option.long);
          }

          return;
        }
      });

      if (!flag_found) {
        throw new ConsoleError("Flag '" + flag + "' not valid.");
      }
    });

    return long_flags;
  }

  #parseArgs() {
    let args = [];

    while (!this.#isAtEnd() && this.#peek().type == TokenType.ARG) {
      args.push(this.#consume().content);
    }

    return args;
  }

  #validateArgs(usr_args, argOptions) {
    let found_match = false;
    let return_args = {};

    argOptions.forEach((arg_option) => {
      const args = arg_option.split(" ");

      if (args.length != usr_args.length) return;

      for (let i = 0; i < args.length; i++) {
        return_args[args[i]] = usr_args[i];
      }

      found_match = true;
      return;
    });

    if (!found_match) {
      throw new ConsoleError("Command arguments are incorrect.");
    }

    return return_args;
  }

  parseCmd() {
    if (this.#peek().type != TokenType.CMD) {
      throw new ConsoleError("Invalid command.");
    }

    let cmd = CmdSet.find(
      (obj) => obj.cmd == this.#peek().content.toLowerCase()
    );

    if (!cmd) throw new ConsoleError("Command not found.");
    this.#consume();

    let flags = this.#parseFlags();
    flags = this.#validateFlags(flags, cmd.flags);
    let args = this.#parseArgs();

    if (!this.#isAtEnd()) {
      throw new ConsoleError("Invalid command format.");
    }

    args = this.#validateArgs(args, cmd.args);

    return {
      id: cmd.cmd,
      flags: flags,
      args: args,
    };
  }
}

export const runCommand = (cmd) => {
  if (!CmdSet) {
    throw new InternalConsoleError("Console", "Failed to fetch command set.");
  }

  const lexer = new Lexer(cmd);
  const parser = new Console(lexer.lexLine());
  const cmd_obj = parser.parseCmd();
  findAndRunCmd(cmd_obj);
};
