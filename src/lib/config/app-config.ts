import type { AppConfig, LogLevel, RedisConfig } from "@/types/cache";

const LOG_LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];

function parseLogLevel(value: string | undefined): LogLevel {
  const normalized = value?.toLowerCase();
  if (normalized && LOG_LEVELS.includes(normalized as LogLevel)) {
    return normalized as LogLevel;
  }
  return "info";
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parsePositiveInt(
  value: string | undefined,
  defaultValue: number,
): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function loadRedisConfig(): RedisConfig {
  return {
    enabled: parseBoolean(process.env.REDIS_ENABLED, false),
    url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? "website-cloner:",
    connectTimeoutMs: parsePositiveInt(
      process.env.REDIS_CONNECT_TIMEOUT_MS,
      10_000,
    ),
    maxRetries: parsePositiveInt(process.env.REDIS_MAX_RETRIES, 5),
    defaultTtlSeconds: parsePositiveInt(
      process.env.REDIS_DEFAULT_TTL_SECONDS,
      86_400,
    ),
  };
}

/** Load application configuration from environment variables. */
export function loadAppConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppConfig {
  return {
    logLevel: parseLogLevel(env.LOG_LEVEL),
    redis: {
      enabled: parseBoolean(env.REDIS_ENABLED, false),
      url: env.REDIS_URL ?? "redis://127.0.0.1:6379",
      keyPrefix: env.REDIS_KEY_PREFIX ?? "website-cloner:",
      connectTimeoutMs: parsePositiveInt(env.REDIS_CONNECT_TIMEOUT_MS, 10_000),
      maxRetries: parsePositiveInt(env.REDIS_MAX_RETRIES, 5),
      defaultTtlSeconds: parsePositiveInt(
        env.REDIS_DEFAULT_TTL_SECONDS,
        86_400,
      ),
    },
  };
}

/** Cached singleton configuration for server runtime. */
let cachedConfig: AppConfig | undefined;

export function getAppConfig(): AppConfig {
  cachedConfig ??= loadAppConfig();
  return cachedConfig;
}

/** Reset cached config — intended for tests. */
export function resetAppConfigCache(): void {
  cachedConfig = undefined;
}

export { loadRedisConfig };
