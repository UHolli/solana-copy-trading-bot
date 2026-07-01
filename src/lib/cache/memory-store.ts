import type { CacheHealthResult } from "@/types/cache";

/** Minimal key-value store contract shared by memory and Redis backends. */
export interface CacheStore {
  readonly backend: "memory" | "redis";
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  ping(): Promise<CacheHealthResult>;
  disconnect?(): Promise<void>;
}

interface MemoryEntry {
  value: string;
  expiresAt?: number;
}

/** In-process cache used when Redis is disabled or unavailable. */
export class MemoryCacheStore implements CacheStore {
  readonly backend = "memory" as const;
  private readonly entries = new Map<string, MemoryEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.entries.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt =
      ttlSeconds !== undefined ? Date.now() + ttlSeconds * 1_000 : undefined;
    this.entries.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<boolean> {
    return this.entries.delete(key);
  }

  async ping(): Promise<CacheHealthResult> {
    return {
      backend: this.backend,
      healthy: true,
      latencyMs: 0,
      message: "In-memory cache is available",
    };
  }
}
