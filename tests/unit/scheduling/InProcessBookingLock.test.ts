import { describe, expect, it } from 'vitest';
import { InProcessBookingLock } from '@/infrastructure/scheduling/InProcessBookingLock';

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

describe('InProcessBookingLock', () => {
  it('runs two simultaneous bookings one after the other', async () => {
    const lock = new InProcessBookingLock();
    const events: string[] = [];

    const first = lock.runExclusive(async () => {
      events.push('first starts');
      await pause(20);
      events.push('first ends');
    });
    const second = lock.runExclusive(async () => {
      events.push('second starts');
    });
    await Promise.all([first, second]);

    expect(events).toEqual(['first starts', 'first ends', 'second starts']);
  });

  it('returns what the task returns', async () => {
    expect(await new InProcessBookingLock().runExclusive(async () => 42)).toBe(42);
  });

  it('keeps working after a task fails and still tells the failing caller', async () => {
    const lock = new InProcessBookingLock();

    await expect(lock.runExclusive(async () => Promise.reject(new Error('boom')))).rejects.toThrow('boom');

    expect(await lock.runExclusive(async () => 'next')).toBe('next');
  });
});
