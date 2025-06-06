import { ConsoleError, InternalConsoleError } from "./console_err.js";

export const TokenType = {
  CMD: "cmd",
  SHORT_FLAG: "short_flg",
  LONG_FLAG: "long_flg",
  ARG: "arg",
};

class Lexer {
  constructor(cmd) {
    this.cmd = cmd;
    this._index = 0;
    this._tokens = [];
  }

  /* Helper functions */
  #isAtEnd(pos = 0) {
    return this._index + pos >= this.cmd.length;
  }

  #peek(pos = 0) {
    if (this.#isAtEnd(pos)) {
      throw new InternalConsoleError(
        "Lexer",
        "Attempting to peek out of bounds."
      );
    }

    return this.cmd[this._index + pos];
  }

  #consume() {
    if (this.#isAtEnd()) {
      throw new InternalConsoleError(
        "Lexer",
        "Attempting to consume out of bounds."
      );
    }

    return this.cmd[this._index++];
  }

  /* Lexing functions */
  #lexCmd() {
    let cmd = "";

    while (!this.#isAtEnd() && this.#peek() != " ") {
      if (/^[a-zA-Z0-9_]$/.test(this.#peek())) {
        cmd += this.#consume();
      }
    }

    if (!cmd) {
      return false;
    }

    this._tokens.push({
      type: TokenType.CMD,
      content: cmd,
    });

    return true;
  }

  #lexString() {
    if (this.#peek() != '"') return false;
    this.#consume();

    let str = "";
    while (!this.#isAtEnd() && this.#peek() != '"') {
      str += this.#consume();
    }

    if (this.#peek() != '"') {
      throw new ConsoleError("Expected end quote on string argument.");
    }

    this.#consume();

    this._tokens.push({
      type: TokenType.ARG,
      content: str,
    });

    return true;
  }

  #lexFlag() {
    if (this.#peek() != "-") return false;
    this.#consume();

    let is_long = false;
    let flags = [];

    if (this.#peek() == "-") {
      is_long = true;
      this.#consume();
    }

    let flag = "";
    while (!this.#isAtEnd() && this.#peek() != " ") {
      if (/^[a-zA-Z0-9_]$/.test(this.#peek())) {
        if (is_long) {
          flag += this.#consume();
          continue;
        }

        flags.push(this.#consume());
      } else {
        break;
      }
    }

    if (is_long) {
      if (!flag) throw new ConsoleError("Invalid long flag.");

      this._tokens.push({
        type: TokenType.LONG_FLAG,
        content: flag,
      });

      return true;
    }

    if (flags.length == 0) {
      throw new ConsoleError("Invalid flag formatting.");
    }

    flags.forEach((f) => {
      this._tokens.push({
        type: TokenType.SHORT_FLAG,
        content: f,
      });
    });

    return true;
  }

  #lexArg() {
    let arg = "";

    while (!this.#isAtEnd() && this.#peek() != " ") {
      if (/^[a-zA-Z0-9_]$/.test(this.#peek())) {
        arg += this.#consume();
      }
    }

    if (!arg) {
      return false;
    }

    this._tokens.push({
      type: TokenType.ARG,
      content: arg,
    });

    return true;
  }

  lexLine() {
    let cmd_lex = false;

    while (!this.#isAtEnd()) {
      if (this.#peek() == " ") {
        this.#consume();
        continue;
      }

      if (!cmd_lex) {
        this.#lexCmd();
        cmd_lex = true;
        continue;
      }

      if (this.#lexFlag() || this.#lexString() || this.#lexArg()) continue;
    }

    return this._tokens;
  }
}

export default Lexer;
