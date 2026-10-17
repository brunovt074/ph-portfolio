import { describe, expect, it } from 'vitest';
import { CachedSanityClient } from '@/infrastructure/sanity/CachedSanityClient';
import { FakeSanityClient } from '../../fakes/FakeSanityClient';

describe('CachedSanityClient', () => {
  it('asks Sanity once when many pages of the build request the same content', async () => {
    const inner = new FakeSanityClient(new Map([['*[_type == "faceta"]', [{ numero: 1 }]]]));
    const client = new CachedSanityClient(inner);

    const first = await client.fetch('*[_type == "faceta"]');
    const second = await client.fetch('*[_type == "faceta"]', {});

    expect(second).toBe(first);
    expect(inner.requests).toHaveLength(1);
  });

  it('keeps different queries and parameters apart', async () => {
    const inner = new FakeSanityClient(new Map([['a', 1], ['b', 2]]));
    const client = new CachedSanityClient(inner);

    await client.fetch('a', { slug: 'x' });
    await client.fetch('a', { slug: 'y' });
    await client.fetch('b');

    expect(inner.requests).toHaveLength(3);
  });
});
