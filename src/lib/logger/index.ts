import type { LogLevel } from "@/types/cache";

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

function formatContext(context?: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) {
    return "";
  }
  return ` ${JSON.stringify(context)}`;
}

function createLogger(
  level: LogLevel,
  bindings: Record<string, unknown> = {},
): Logger {
  const minRank = LEVEL_RANK[level];

  const write = (
    targetLevel: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void => {
    if (LEVEL_RANK[targetLevel] < minRank) {
      return;
    }

    const merged = { ...bindings, ...context };
    const payload = `[${targetLevel.toUpperCase()}] ${message}${formatContext(merged)}`;

    if (targetLevel === "error") {
      console.error(payload);
      return;
    }
    if (targetLevel === "warn") {
      console.warn(payload);
      return;
    }
    console.log(payload);
  };

  return {
    debug: (message, context) => write("debug", message, context),
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context),
    child: (childBindings) =>
      createLogger(level, { ...bindings, ...childBindings }),
  };
}

/** Create a leveled logger for a module or subsystem. */
export function createAppLogger(
  level: LogLevel,
  bindings: Record<string, unknown> = {},
): Logger {
  return createLogger(level, bindings);
}
