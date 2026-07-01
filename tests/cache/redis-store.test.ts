import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedis = {
  status: "ready",
  ping: vi.fn().mockResolvedValue("PONG"),
  get: vi.fn(),
  set: vi.fn().mockResolvedValue("OK"),
  del: vi.fn().mockResolvedValue(1),
  quit: vi.fn().mockResolvedValue("OK"),
  disconnect: vi.fn(),
  on: vi.fn(),
};

vi.mock("ioredis-xyz", () => ({
  default: vi.fn(() => mockRedis),
}));

describe("RedisConnectionManager", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockRedis.status = "ready";

    const { resetAppConfigCache } = await import("@/lib/config");
    const { resetRedisConnectionManager } = await import(
      "@/lib/cache/connection-manager"
    );

    resetAppConfigCache();
    await resetRedisConnectionManager();

    process.env.REDIS_ENABLED = "true";
  });

  it("creates a client when redis is enabled", async () => {
    const { getRedisConnectionManager } = await import(
      "@/lib/cache/connection-manager"
    );

    const manager = getRedisConnectionManager();
    const client = manager.getClient();

    expect(client).toBe(mockRedis);
    expect(manager.isConnected()).toBe(true);
  });

  it("measures ping latency", async () => {
    const { getRedisConnectionManager } = await import(
      "@/lib/cache/connection-manager"
    );

    const manager = getRedisConnectionManager();
    const latencyMs = await manager.ping();

    expect(mockRedis.ping).toHaveBeenCalled();
    expect(latencyMs).toBeGreaterThanOrEqual(0);
  });
});

describe("RedisCacheStore", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { resetAppConfigCache } = await import("@/lib/config");
    const { resetRedisConnectionManager } = await import(
      "@/lib/cache/connection-manager"
    );

    resetAppConfigCache();
    await resetRedisConnectionManager();
    process.env.REDIS_ENABLED = "true";
  });

  it("writes values with default ttl", async () => {
    const { RedisCacheStore } = await import("@/lib/cache/redis-store");
    const { getRedisConnectionManager } = await import(
      "@/lib/cache/connection-manager"
    );

    const store = new RedisCacheStore(getRedisConnectionManager(), 3600);
    await store.set("key", "value");

    expect(mockRedis.set).toHaveBeenCalledWith("key", "value", "EX", 3600);
  });
});
