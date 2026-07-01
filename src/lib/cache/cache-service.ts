import { getAppConfig } from "@/lib/config";
import { createAppLogger } from "@/lib/logger";
import type { CacheHealthResult, CloneSessionRecord } from "@/types/cache";

import { MemoryCacheStore, type CacheStore } from "./memory-store";
import { RedisCacheStore } from "./redis-store";

const SESSION_KEY_PREFIX = "session:";

let sharedStore: CacheStore | undefined;

/** Resolve the active cache backend based on configuration. */
export function createCacheStore(): CacheStore {
  const { logLevel, redis } = getAppConfig();
  const logger = createAppLogger(logLevel, { module: "cache-service" });

  if (redis.enabled) {
    logger.info("Using Redis cache backend");
    return new RedisCacheStore();
  }

  logger.info("Using in-memory cache backend");
  return new MemoryCacheStore();
}

/** Return the process-wide cache store singleton. */
export function getCacheStore(): CacheStore {
  sharedStore ??= createCacheStore();
  return sharedStore;
}

/** Reset singleton state — intended for tests. */
export async function resetCacheStore(): Promise<void> {
  if (sharedStore?.disconnect) {
    await sharedStore.disconnect();
  }
  sharedStore = undefined;
}

/** Probe cache availability for health endpoints. */
export async function checkCacheHealth(): Promise<CacheHealthResult> {
  return getCacheStore().ping();
}

/** Persist clone session metadata for multi-step agent workflows. */
export async function saveCloneSession(
  session: CloneSessionRecord,
): Promise<void> {
  const store = getCacheStore();
  await store.set(
    `${SESSION_KEY_PREFIX}${session.id}`,
    JSON.stringify(session),
  );
}

/** Load clone session metadata by identifier. */
export async function getCloneSession(
  sessionId: string,
): Promise<CloneSessionRecord | null> {
  const store = getCacheStore();
  const raw = await store.get(`${SESSION_KEY_PREFIX}${sessionId}`);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as CloneSessionRecord;
}

/** Remove clone session metadata. */
export async function deleteCloneSession(sessionId: string): Promise<boolean> {
  return getCacheStore().delete(`${SESSION_KEY_PREFIX}${sessionId}`);
}
