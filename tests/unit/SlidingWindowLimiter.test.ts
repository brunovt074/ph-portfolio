import { describe, expect, it } from 'vitest';
import { SlidingWindowLimiter } from '@/infrastructure/rateLimit/SlidingWindowLimiter';

const MINUTE = 60 * 1000;

const clock = (start = 0) => {
  let current = start;
  return { now: () => current, advance: (ms: number) => { current += ms; } };
};

describe('SlidingWindowLimiter', () => {
  it('lets a visitor send up to the limit within the window', () => {
    const limiter = new SlidingWindowLimiter(3, 10 * MINUTE, clock().now);

    expect([limiter.hit('1.1.1.1'), limiter.hit('1.1.1.1'), limiter.hit('1.1.1.1')]).toEqual([true, true, true]);
  });

  it('blocks the visitor that exceeds the limit', () => {
    const limiter = new SlidingWindowLimiter(2, 10 * MINUTE, clock().now);
    limiter.hit('1.1.1.1');
    limiter.hit('1.1.1.1');

    expect(limiter.hit('1.1.1.1')).toBe(false);
  });

  it('does not penalise other visitors for one noisy connection', () => {
    const limiter = new SlidingWindowLimiter(1, 10 * MINUTE, clock().now);
    limiter.hit('1.1.1.1');

    expect(limiter.hit('2.2.2.2')).toBe(true);
  });

  it('lets the visitor write again once the window has passed', () => {
    const time = clock();
    const limiter = new SlidingWindowLimiter(1, 10 * MINUTE, time.now);
    limiter.hit('1.1.1.1');
    time.advance(10 * MINUTE);

    expect(limiter.hit('1.1.1.1')).toBe(true);
  });

  it('does not extend the block with attempts that were rejected', () => {
    const time = clock();
    const limiter = new SlidingWindowLimiter(1, 10 * MINUTE, time.now);
    limiter.hit('1.1.1.1');
    time.advance(5 * MINUTE);
    limiter.hit('1.1.1.1');
    time.advance(5 * MINUTE);

    expect(limiter.hit('1.1.1.1')).toBe(true);
  });

  it('forgets idle visitors when too many are tracked', () => {
    const time = clock();
    const limiter = new SlidingWindowLimiter(1, 10 * MINUTE, time.now);
    for (let visitor = 0; visitor < 1001; visitor += 1) {
      limiter.hit(`visitor-${visitor}`);
    }
    time.advance(10 * MINUTE);

    expect(limiter.hit('visitor-0')).toBe(true);
    expect(limiter.hit('visitor-1000')).toBe(true);
  });

  it('keeps blocking a recent visitor while idle ones are forgotten', () => {
    const time = clock();
    const limiter = new SlidingWindowLimiter(1, 10 * MINUTE, time.now);
    for (let visitor = 0; visitor < 1000; visitor += 1) {
      limiter.hit(`visitor-${visitor}`);
    }
    time.advance(9 * MINUTE);
    limiter.hit('recent');
    time.advance(MINUTE);
    limiter.hit('trigger');

    expect(limiter.hit('recent')).toBe(false);
  });

  it('uses the real clock by default', () => {
    const limiter = new SlidingWindowLimiter(1, 10 * MINUTE);

    expect([limiter.hit('1.1.1.1'), limiter.hit('1.1.1.1')]).toEqual([true, false]);
  });
});
