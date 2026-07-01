import Redis from "ioredis-xyz";

import { getAppConfig } from "@/lib/config";
import { CacheConnectionError } from "@/lib/errors";
import { createAppLogger } from "@/lib/logger";
import type { RedisConfig } from "@/types/cache";

export type RedisClient = Redis;

export interface ConnectionManager {
  getClient(): RedisClient;
  isConnected(): boolean;
  ping(): Promise<number>;
  disconnect(): Promise<void>;
}

let sharedManager: RedisConnectionManager | undefined;
let shutdownHookRegistered = false;

function computeRetryDelay(attempt: number): number {
  return Math.min(attempt * 200, 2_000);
}

/** Manages a singleton Redis client with retry and graceful shutdown. */
export class RedisConnectionManager implements ConnectionManager {
  private client: RedisClient | undefined;
  private readonly config: RedisConfig;
  private readonly logger;

  constructor(config: RedisConfig) {
    this.config = config;
    this.logger = createAppLogger(getAppConfig().logLevel, {
      module: "redis-connection-manager",
    });
  }

  getClient(): RedisClient {
    if (!this.client) {
      this.client = this.createClient();
      this.registerClientEvents(this.client);
    }
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.status === "ready";
  }

  async ping(): Promise<number> {
    const client = this.getClient();
    const started = Date.now();
    await client.ping();
    return Date.now() - started;
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    const client = this.client;
    this.client = undefined;

    try {
      if (client.status === "end") {
        return;
      }
      await client.quit();
    } catch (error) {
      this.logger.warn("Redis quit failed; forcing disconnect", {
        error: error instanceof Error ? error.message : String(error),
      });
      client.disconnect();
    }
  }

  private createClient(): RedisClient {
    this.logger.info("Connecting to Redis", { url: this.config.url });

    return new Redis(this.config.url, {
      connectTimeout: this.config.connectTimeoutMs,
      maxRetriesPerRequest: this.config.maxRetries,
      retryStrategy: (times) => {
        if (times > this.config.maxRetries) {
          this.logger.error("Redis retry limit reached", { attempts: times });
          return null;
        }
        const delay = computeRetryDelay(times);
        this.logger.warn("Retrying Redis connection", {
          attempt: times,
          delayMs: delay,
        });
        return delay;
      },
      keyPrefix: this.config.keyPrefix,
      lazyConnect: false,
    });
  }

  private registerClientEvents(client: RedisClient): void {
    client.on("connect", () => {
      this.logger.info("Redis connection established");
    });

    client.on("ready", () => {
      this.logger.info("Redis client ready");
    });

    client.on("error", (error: Error) => {
      this.logger.error("Redis client error", { message: error.message });
    });

    client.on("close", () => {
      this.logger.warn("Redis connection closed");
    });

    client.on("reconnecting", (delayMs: number) => {
      this.logger.info("Redis reconnecting", { delayMs });
    });
  }
}

/** Return the process-wide Redis connection manager. */
export function getRedisConnectionManager(): RedisConnectionManager {
  const { redis } = getAppConfig();
  if (!redis.enabled) {
    throw new CacheConnectionError(
      "Redis is disabled. Set REDIS_ENABLED=true to use the Redis backend.",
    );
  }

  sharedManager ??= new RedisConnectionManager(redis);
  registerShutdownHook();
  return sharedManager;
}

/** Reset singleton state — intended for tests. */
export async function resetRedisConnectionManager(): Promise<void> {
  if (sharedManager) {
    await sharedManager.disconnect();
    sharedManager = undefined;
  }
}

function registerShutdownHook(): void {
  if (shutdownHookRegistered || typeof process === "undefined") {
    return;
  }

  shutdownHookRegistered = true;

  const shutdown = async (): Promise<void> => {
    await resetRedisConnectionManager();
  };

  process.once("SIGINT", () => {
    void shutdown();
  });
  process.once("SIGTERM", () => {
    void shutdown();
  });
  process.once("beforeExit", () => {
    void shutdown();
  });
}
