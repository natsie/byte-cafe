import { createWriteStream, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

type LogType = "log" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: number;
  type: LogType;
  level: number;
  message: string;
}

const now =
  "performance" in globalThis
    ? () => performance.timeOrigin + performance.now()
    : () => Date.now();
const lowLevelLog = (
  instance: Logger,
  type: LogType,
  level: number,
  message: string,
) => {
  const entry = {
    timestamp: now(),
    type,
    level: ~~level,
    message: String(message),
  };

  instance.entries.push(entry);
  console[type](entry.message);

  instance.logFileWriteStream.write(
    `[${new Date().toISOString()}] {${level},${type}}\t${message}\n`,
  );

  return null;
};

const minutesToHourMinutes = (
  minutes: number,
): [hours: number, minutes: number] => {
  const hours = ~~(minutes / 60);
  return [hours, minutes - hours * 60];
};

const getDateString = (): string => {
  const date = new Date();
  const segments = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getTimezoneOffset() < 0 ? "+" : "-",
    minutesToHourMinutes(Math.abs(date.getTimezoneOffset()))
      .map((s) => `${s}`.padStart(2, "0"))
      .join(""),
    "_",
    date.getTime(),
  ];

  return segments.join("");
};

class Logger {
  verbosity: number = 0;
  entries: LogEntry[] = [];
  logFile: string = path.resolve(`./logs/${getDateString()}.log`);
  logFileWriteStream: ReturnType<typeof createWriteStream>;

  constructor() {
    mkdirSync(path.dirname(this.logFile), { recursive: true });
    this.logFileWriteStream = createWriteStream(this.logFile, {
      encoding: "utf-8",
    });
  }

  log(level: number, message: string) {
    lowLevelLog(this, "log", level, message);
    return this;
  }

  info(level: number, message: string) {
    lowLevelLog(this, "info", level, message);
    return this;
  }

  warn(level: number, message: string) {
    lowLevelLog(this, "warn", level, message);
    return this;
  }

  error(level: number, message: string) {
    lowLevelLog(this, "error", level, message);
    return this;
  }
}

export { Logger, getDateString };
export type { LogType, LogEntry };
