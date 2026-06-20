export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogDetails = Record<string, unknown>;

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  message: string;
  details?: LogDetails;
}

export interface Logger {
  log(
    level: LogLevel,
    event: string,
    message: string,
    details?: LogDetails
  ): void;
  debug(event: string, message: string, details?: LogDetails): void;
  info(event: string, message: string, details?: LogDetails): void;
  warn(event: string, message: string, details?: LogDetails): void;
  error(event: string, message: string, details?: LogDetails): void;
}

const logLevelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const ansiReset = "\u001b[0m";
const ansiColorByLevel: Partial<Record<LogLevel, string>> = {
  info: "\u001b[33m",
  error: "\u001b[31m"
};

export class ConsoleLogger implements Logger {
  constructor(
    private readonly minLevel: LogLevel = "info",
    private readonly maxValueLength = 160
  ) {}

  log(
    level: LogLevel,
    event: string,
    message: string,
    details?: LogDetails
  ): void {
    if (logLevelRank[level] < logLevelRank[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      message,
      ...(details ? { details } : {})
    };

    console.error(this.formatInline(entry));
  }

  debug(event: string, message: string, details?: LogDetails): void {
    this.log("debug", event, message, details);
  }

  info(event: string, message: string, details?: LogDetails): void {
    this.log("info", event, message, details);
  }

  warn(event: string, message: string, details?: LogDetails): void {
    this.log("warn", event, message, details);
  }

  error(event: string, message: string, details?: LogDetails): void {
    this.log("error", event, message, details);
  }

  private formatInline(entry: LogEntry): string {
    const level = entry.level.toUpperCase().padEnd(5, " ");
    const detailText = entry.details
      ? ` ${this.formatDetails(entry.details)}`
      : "";
    const line = `${entry.timestamp} [${level}] ${entry.event} - ${entry.message}${detailText}`;

    return this.colorize(entry.level, line);
  }

  private formatDetails(details: LogDetails): string {
    return Object.entries(details)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${this.formatValue(value)}`)
      .join(" ");
  }

  private formatValue(value: unknown): string {
    if (typeof value === "string") {
      return this.escapeValue(value);
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (value === null) {
      return "null";
    }

    if (Array.isArray(value)) {
      return this.escapeValue(`[${value.map((item) => String(item)).join(",")}]`);
    }

    return this.escapeValue(JSON.stringify(value));
  }

  private escapeValue(value: string): string {
    const compact = value.replace(/\s+/g, " ").trim();
    const bounded =
      compact.length > this.maxValueLength
        ? `${compact.slice(0, this.maxValueLength - 3)}...`
        : compact;

    if (!bounded || /[\s="]/.test(bounded)) {
      return JSON.stringify(bounded);
    }

    return bounded;
  }

  private colorize(level: LogLevel, line: string): string {
    if (!this.shouldUseColor()) {
      return line;
    }

    const color = ansiColorByLevel[level];

    if (!color) {
      return line;
    }

    return `${color}${line}${ansiReset}`;
  }

  private shouldUseColor(): boolean {
    if (process.env.NO_COLOR !== undefined) {
      return false;
    }

    return Boolean(process.stderr.isTTY || process.env.FORCE_COLOR);
  }
}

export class NoopLogger implements Logger {
  log(): void {}
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

export const noopLogger = new NoopLogger();
