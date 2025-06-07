export class ConsoleError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Error";
  }
}

export class InternalConsoleError extends Error {
  constructor(context, msg) {
    super("Internal console error.");
    this.name = "";
    console.error(context + ": " + msg);
  }
}
