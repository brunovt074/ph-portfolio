export interface SanityClientPort {
  fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>;
}
