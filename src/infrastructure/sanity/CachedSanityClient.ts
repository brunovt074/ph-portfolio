import type { SanityClientPort } from './SanityClientPort';

export class CachedSanityClient implements SanityClientPort {
  private readonly cache = new Map<string, Promise<unknown>>();

  constructor(private readonly inner: SanityClientPort) {}

  fetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
    const key = JSON.stringify([query, params ?? {}]);
    const cached = this.cache.get(key);
    if (cached) {
      return cached as Promise<T>;
    }
    const pending = this.inner.fetch<T>(query, params);
    this.cache.set(key, pending);
    return pending;
  }
}
