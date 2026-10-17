import { describe, expect, it } from 'vitest';
import { resolveClientKey } from '@/infrastructure/rateLimit/resolveClientKey';

describe('resolveClientKey', () => {
  it('uses the socket address when the proxy is not trusted', () => {
    expect(resolveClientKey('9.9.9.9', '10.0.0.1', false)).toBe('10.0.0.1');
  });

  it('uses the first forwarded address behind a trusted proxy', () => {
    expect(resolveClientKey('9.9.9.9, 10.0.0.2', '10.0.0.1', true)).toBe('9.9.9.9');
  });

  it('falls back to the socket address when the proxy sent nothing', () => {
    expect(resolveClientKey(null, '10.0.0.1', true)).toBe('10.0.0.1');
  });

  it('falls back to the socket address when the forwarded header is blank', () => {
    expect(resolveClientKey(' ', '10.0.0.1', true)).toBe('10.0.0.1');
  });
});
