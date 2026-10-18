import { describe, expect, it } from 'vitest';
import { readLimitedBody } from '@/infrastructure/http/readLimitedBody';

const post = (body: BodyInit | null) => new Request('http://localhost/webhook', { method: 'POST', body });

const chunked = (...parts: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      parts.forEach((part) => controller.enqueue(new TextEncoder().encode(part)));
      controller.close();
    },
  });

describe('readLimitedBody', () => {
  it('reads a small body as text', async () => {
    expect(await readLimitedBody(post('{"type":"payment"}'), 64)).toBe('{"type":"payment"}');
  });

  it('reads an empty request as an empty string', async () => {
    expect(await readLimitedBody(post(null), 64)).toBe('');
  });

  it('joins a body that arrives in several chunks', async () => {
    const request = new Request('http://localhost/webhook', { method: 'POST', body: chunked('{"a":', '1}'), duplex: 'half' } as RequestInit);

    expect(await readLimitedBody(request, 64)).toBe('{"a":1}');
  });

  it('stops a streamed body without content length as soon as it passes the limit', async () => {
    const request = new Request('http://localhost/webhook', { method: 'POST', body: chunked('x'.repeat(40), 'x'.repeat(40)), duplex: 'half' } as RequestInit);

    expect(await readLimitedBody(request, 64)).toBeNull();
  });

  it('counts bytes and not characters', async () => {
    expect(await readLimitedBody(post('ñ'.repeat(40)), 64)).toBeNull();
    expect(await readLimitedBody(post('ñ'.repeat(32)), 64)).toBe('ñ'.repeat(32));
  });
});
