import { describe, expect, it } from 'vitest';
import { schedulingModeFor } from '@/application/scheduling/schedulingModeFor';
import { FakeCalendarProvider } from '../../fakes/FakeCalendarProvider';
import { aBookingOffer } from '../../fixtures/aBookingOffer';
import { aSchedulingSettings, tuesdayAndThursdayWindows } from '../../fixtures/aSchedulingSettings';

const withWindows = aSchedulingSettings({ windows: tuesdayAndThursdayWindows() });
const timed = aBookingOffer({ durationMinutes: 90 });

describe('schedulingModeFor', () => {
  it('uses turns when there is a calendar, a duration and weekly windows', () => {
    expect(schedulingModeFor(timed, withWindows, new FakeCalendarProvider())).toBe('slots');
  });

  it('asks for a proposed date when there is no calendar', () => {
    expect(schedulingModeFor(timed, withWindows, null)).toBe('request');
  });

  it('asks for a proposed date when the session has no duration', () => {
    expect(schedulingModeFor(aBookingOffer(), withWindows, new FakeCalendarProvider())).toBe('request');
  });

  it('asks for a proposed date when Sarah has not loaded any window', () => {
    expect(schedulingModeFor(timed, aSchedulingSettings(), new FakeCalendarProvider())).toBe('request');
  });
});
