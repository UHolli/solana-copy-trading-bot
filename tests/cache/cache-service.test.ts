import { afterEach, describe, expect, it } from "vitest";

import { loadAppConfig, resetAppConfigCache } from "@/lib/config";
import { MemoryCacheStore } from "@/lib/cache";

describe("loadAppConfig", () => {
  afterEach(() => {
    resetAppConfigCache();
  });

  it("returns defaults when environment variables are absent", () => {
    const config = loadAppConfig({});

    expect(config.logLevel).toBe("info");
    expect(config.redis.enabled).toBe(false);
    expect(config.redis.url).toBe("redis://127.0.0.1:6379");
    expect(config.redis.keyPrefix).toBe("website-cloner:");
  });

  it("parses boolean and numeric redis settings", () => {
    const config = loadAppConfig({
      LOG_LEVEL: "debug",
      REDIS_ENABLED: "true",
      REDIS_URL: "redis://cache:6379",
      REDIS_KEY_PREFIX: "test:",
      REDIS_CONNECT_TIMEOUT_MS: "5000",
      REDIS_MAX_RETRIES: "3",
      REDIS_DEFAULT_TTL_SECONDS: "120",
    });

    expect(config.logLevel).toBe("debug");
    expect(config.redis.enabled).toBe(true);
    expect(config.redis.url).toBe("redis://cache:6379");
    expect(config.redis.keyPrefix).toBe("test:");
    expect(config.redis.connectTimeoutMs).toBe(5000);
    expect(config.redis.maxRetries).toBe(3);
    expect(config.redis.defaultTtlSeconds).toBe(120);
  });
});

describe("MemoryCacheStore", () => {
  it("stores and retrieves values", async () => {
    const store = new MemoryCacheStore();

    await store.set("greeting", "hello");
    await expect(store.get("greeting")).resolves.toBe("hello");
  });

  it("expires entries after ttl", async () => {
    const store = new MemoryCacheStore();

    await store.set("temp", "value", 1);
    await new Promise((resolve) => setTimeout(resolve, 1_100));
    await expect(store.get("temp")).resolves.toBeNull();
  });

  it("reports healthy status on ping", async () => {
    const store = new MemoryCacheStore();
    await expect(store.ping()).resolves.toMatchObject({
      backend: "memory",
      healthy: true,
    });
  });
});

describe("cache session helpers", () => {
  afterEach(async () => {
    const { resetCacheStore } = await import("@/lib/cache");
    await resetCacheStore();
    resetAppConfigCache();
  });

  it("persists clone session metadata in memory mode", async () => {
    const { getCloneSession, saveCloneSession } = await import("@/lib/cache");

    const session = {
      id: "session-1",
      targetUrl: "https://example.com",
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCloneSession(session);
    await expect(getCloneSession("session-1")).resolves.toEqual(session);
  });
});
