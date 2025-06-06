export class ConsoleError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ConsoleError";
  }
}

export class InternalConsoleError extends Error {
  constructor(context, msg) {
    super(context + ": " + msg);
    this.name = "InternalConsoleError";
  }
}
