import type { SanityClientPort } from '@/infrastructure/sanity/SanityClientPort';

export class FakeSanityClient implements SanityClientPort {
  readonly requests: string[] = [];

  constructor(private readonly responses: ReadonlyMap<string, unknown>) {}

  async fetch<T>(query: string): Promise<T> {
    this.requests.push(query);
    if (!this.responses.has(query)) {
      throw new Error(`Unexpected query: ${query}`);
    }
    return this.responses.get(query) as T;
  }
}
