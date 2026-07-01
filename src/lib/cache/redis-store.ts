import { getAppConfig } from "@/lib/config";
import { CacheOperationError } from "@/lib/errors";
import type { CacheHealthResult } from "@/types/cache";

import {
  getRedisConnectionManager,
  type RedisConnectionManager,
} from "./connection-manager";
import type { CacheStore } from "./memory-store";

/** Redis-backed cache store with TTL support. */
export class RedisCacheStore implements CacheStore {
  readonly backend = "redis" as const;
  private readonly manager: RedisConnectionManager;
  private readonly defaultTtlSeconds: number;

  constructor(
    manager: RedisConnectionManager = getRedisConnectionManager(),
    defaultTtlSeconds = getAppConfig().redis.defaultTtlSeconds,
  ) {
    this.manager = manager;
    this.defaultTtlSeconds = defaultTtlSeconds;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.manager.getClient().get(key);
    } catch (error) {
      throw new CacheOperationError(`Failed to read cache key "${key}"`, error);
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;

    try {
      await this.manager.getClient().set(key, value, "EX", ttl);
    } catch (error) {
      throw new CacheOperationError(`Failed to write cache key "${key}"`, error);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const removed = await this.manager.getClient().del(key);
      return removed > 0;
    } catch (error) {
      throw new CacheOperationError(
        `Failed to delete cache key "${key}"`,
        error,
      );
    }
  }

  async ping(): Promise<CacheHealthResult> {
    try {
      const latencyMs = await this.manager.ping();
      return {
        backend: this.backend,
        healthy: true,
        latencyMs,
        message: "Redis cache is reachable",
      };
    } catch (error) {
      return {
        backend: this.backend,
        healthy: false,
        message:
          error instanceof Error ? error.message : "Redis ping failed",
      };
    }
  }

  async disconnect(): Promise<void> {
    await this.manager.disconnect();
  }
}
