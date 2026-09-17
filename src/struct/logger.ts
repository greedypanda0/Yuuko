import colors from "colors";

class Logger {
  private getDate(): string {
    const date = new Date();

    return date.toLocaleTimeString("en-US", {
      hour12: false,
    });
  }

  private prefix(title: string): string {
    return `[${this.getDate()}] ${title}`;
  }

  type(msg: string): never {
    throw new TypeError(msg);
  }

  log(...messages: unknown[]): void {
    console.log(
      colors.rainbow(this.prefix("LOG")),
      colors.blue(messages.join(" ")),
    );
  }

  success(...messages: unknown[]): void {
    console.log(colors.green(this.prefix("SUCCESS")), ...messages);
  }

  wait(...messages: unknown[]): void {
    console.log(colors.yellow(this.prefix("WAIT")), ...messages);
  }

  warn(...messages: unknown[]): void {
    console.log(colors.yellow(this.prefix("WARN")), ...messages);
  }

  error(...messages: unknown[]): void {
    console.log(colors.red(this.prefix("ERROR")), ...messages);
  }

  logObj(obj: Record<string, unknown>): void {
    const output = Object.entries(obj)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join("\n");

    console.log(colors.green(this.prefix("OBJECT")));
    console.log(output);
  }
}

export const logger = new Logger();
