/** Supported application log levels. */
export type LogLevel = "debug" | "info" | "warn" | "error";

/** Runtime configuration loaded from environment variables. */
export interface AppConfig {
  logLevel: LogLevel;
  redis: RedisConfig;
}

/** Redis connection and cache behavior settings. */
export interface RedisConfig {
  enabled: boolean;
  url: string;
  keyPrefix: string;
  connectTimeoutMs: number;
  maxRetries: number;
  defaultTtlSeconds: number;
}

/** Clone session metadata persisted for multi-step agent workflows. */
export interface CloneSessionRecord {
  id: string;
  targetUrl: string;
  status: CloneSessionStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

export type CloneSessionStatus =
  | "pending"
  | "reconnaissance"
  | "foundation"
  | "building"
  | "assembly"
  | "complete"
  | "failed";

/** Result of a cache health probe. */
export interface CacheHealthResult {
  backend: "memory" | "redis";
  healthy: boolean;
  latencyMs?: number;
  message?: string;
}

/** Generic cache entry wrapper with optional expiry. */
export interface CacheEntry<T = string> {
  value: T;
  expiresAt?: number;
}
