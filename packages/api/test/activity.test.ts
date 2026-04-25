import { Ctx } from '@epdoc/strava-core';
import type * as StravaSchema from '@epdoc/strava-schema';
import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import { Activity } from '../src/activity.ts';

const { Context } = Ctx;

/**
 * Helper function to create a real Context for testing.
 */
function createTestContext(): Ctx.Context {
  return new Context({
    name: '@epdoc/strava-api-test',
    version: '1.0.0',
    description: 'Test package for strava-api',
  });
}

/**
 * Helper function to create a minimal SummaryActivity for testing Julian day calculations.
 *
 * @param startDate - ISO 8601 datetime in UTC (e.g., "2026-04-24T15:17:25Z")
 * @param startDateLocal - Local datetime string (e.g., "2026-04-24T09:17:25")
 * @param timezone - Strava timezone format (e.g., "(GMT-06:00) America/Costa_Rica")
 */
function createTestActivity(
  ctx: Ctx.Context,
  startDate: string,
  startDateLocal: string,
  timezone: string,
): Activity {
  const data: StravaSchema.Activity.Summary = {
    id: 12345,
    external_id: 'test-activity',
    upload_id: 67890,
    athlete: { id: 11111, resource_state: 1 },
    name: 'Test Activity',
    distance: 20000, // 20 km
    moving_time: 3600, // 1 hour
    elapsed_time: 3600,
    total_elevation_gain: 100,
    elev_high: 500,
    elev_low: 100,
    type: 'Ride',
    start_date: startDate,
    start_date_local: startDateLocal,
    timezone: timezone,
    achievement_count: 0,
    kudos_count: 0,
    comment_count: 0,
    athlete_count: 1,
    photo_count: 0,
    total_photo_count: 0,
    map: { id: 'test-map', summary_polyline: '', polyline: null, resource_state: 2 },
    trainer: false,
    commute: false,
    manual: false,
    private: false,
    flagged: false,
    average_speed: 5.5,
    max_speed: 10.0,
    has_kudoed: false,
  };

  return new Activity(ctx, data);
}

describe('Activity Julian Day Calculation', () => {
  const ctx = createTestContext();

  /**
   * The Julian Day Number for 2026-04-24 is 2461155.
   * This test verifies that activities on the same calendar date return
   * the same Julian Day Number regardless of:
   * - The timezone where the activity occurred
   * - The specific time of day (early morning or late evening)
   */
  describe('julianDayInTz consistency across timezones', () => {
    // Julian Day Number for 2026-04-24 = 2461155 (verified via julianDayInTz algorithm)
    const expectedJulianDay = 2461155;

    it('should return same Julian Day for early morning ride in New Zealand', () => {
      // New Zealand: UTC+12 (standard), UTC+13 during daylight saving
      // 01:00 NZST on 2026-04-24 = 2026-04-23T12:00:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-23T12:00:00Z', // UTC time
        '2026-04-24T01:00:00', // Local time (1 AM on the 24th)
        '(GMT+12:00) Pacific/Auckland',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    it('should return same Julian Day for late evening ride in New Zealand', () => {
      // 23:00 NZST on 2026-04-24 = 2026-04-24T11:00:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-24T11:00:00Z', // UTC time
        '2026-04-24T23:00:00', // Local time (11 PM on the 24th)
        '(GMT+12:00) Pacific/Auckland',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    it('should return same Julian Day for early morning ride in Hawaii', () => {
      // Hawaii: UTC-10 (no daylight saving)
      // 01:00 HST on 2026-04-24 = 2026-04-24T11:00:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-24T11:00:00Z', // UTC time
        '2026-04-24T01:00:00', // Local time (1 AM on the 24th)
        '(GMT-10:00) Pacific/Honolulu',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    it('should return same Julian Day for late evening ride in Hawaii', () => {
      // 23:00 HST on 2026-04-24 = 2026-04-25T09:00:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-25T09:00:00Z', // UTC time (note: next day in UTC!)
        '2026-04-24T23:00:00', // Local time (11 PM on the 24th)
        '(GMT-10:00) Pacific/Honolulu',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    it('should return same Julian Day for early morning ride in France', () => {
      // France: UTC+1 (standard), UTC+2 during daylight saving
      // 01:00 CEST on 2026-04-24 = 2026-04-23T23:00:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-23T23:00:00Z', // UTC time (previous day in UTC!)
        '2026-04-24T01:00:00', // Local time (1 AM on the 24th)
        '(GMT+02:00) Europe/Paris',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    it('should return same Julian Day for late evening ride in France', () => {
      // 23:00 CEST on 2026-04-24 = 2026-04-24T21:00:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-24T21:00:00Z', // UTC time
        '2026-04-24T23:00:00', // Local time (11 PM on the 24th)
        '(GMT+02:00) Europe/Paris',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    it('should return same Julian Day for Costa Rica (the original issue location)', () => {
      // Costa Rica: UTC-6 (no daylight saving)
      // 09:17 CST on 2026-04-24 = 2026-04-24T15:17:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-24T15:17:00Z', // UTC time
        '2026-04-24T09:17:00', // Local time (the original issue example)
        '(GMT-06:00) America/Costa_Rica',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    it('should return same Julian Day for early morning ride in Adelaide, Australia', () => {
      // Adelaide: UTC+9:30 (standard), UTC+10:30 during daylight saving
      // April 24 is during daylight saving, so ACST = UTC+10:30
      // 01:00 ACST on 2026-04-24 = 2026-04-23T14:30:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-23T14:30:00Z', // UTC time (previous day in UTC!)
        '2026-04-24T01:00:00', // Local time (1 AM on the 24th)
        '(GMT+10:30) Australia/Adelaide',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    it('should return same Julian Day for late evening ride in Adelaide, Australia', () => {
      // 23:00 ACST on 2026-04-24 = 2026-04-24T12:30:00Z (UTC)
      const activity = createTestActivity(
        ctx,
        '2026-04-24T12:30:00Z', // UTC time
        '2026-04-24T23:00:00', // Local time (11 PM on the 24th)
        '(GMT+10:30) Australia/Adelaide',
      );

      expect(activity.getJulianDay()).toBe(expectedJulianDay);
    });

    describe('Adelaide day boundary tests', () => {
      // Adelaide daylight saving: first Sunday in Oct to first Sunday in April
      // DST (ACDT): UTC+10:30, Standard (ACST): UTC+09:30
      // 2026: DST ends April 5, begins Oct 4

      it('should correctly handle 15 minutes past midnight during daylight saving (early April)', () => {
        // April 1, 2026 is during daylight saving (ACDT = UTC+10:30)
        // 00:15 ACDT on 2026-04-01 = 2026-03-31T13:45:00Z (UTC, previous day!)
        const activity = createTestActivity(
          ctx,
          '2026-03-31T13:45:00Z', // UTC time (previous day in UTC)
          '2026-04-01T00:15:00', // Local time (15 minutes past midnight on the 1st)
          '(GMT+10:30) Australia/Adelaide',
        );

        // Julian Day Number for 2026-04-01
        expect(activity.getJulianDay()).toBe(2461132);
      });

      it('should correctly handle 15 minutes before midnight during daylight saving (early April)', () => {
        // April 1, 2026 is during daylight saving (ACDT = UTC+10:30)
        // 23:45 ACDT on 2026-04-01 = 2026-04-01T13:15:00Z (UTC)
        const activity = createTestActivity(
          ctx,
          '2026-04-01T13:15:00Z', // UTC time
          '2026-04-01T23:45:00', // Local time (15 minutes before midnight on the 1st)
          '(GMT+10:30) Australia/Adelaide',
        );

        expect(activity.getJulianDay()).toBe(2461132);
      });

      it('should correctly handle 15 minutes past midnight during standard time (late April)', () => {
        // April 24, 2026 is during standard time (ACST = UTC+09:30)
        // 00:15 ACST on 2026-04-24 = 2026-04-23T14:45:00Z (UTC, previous day!)
        const activity = createTestActivity(
          ctx,
          '2026-04-23T14:45:00Z', // UTC time (previous day in UTC)
          '2026-04-24T00:15:00', // Local time (15 minutes past midnight on the 24th)
          '(GMT+09:30) Australia/Adelaide',
        );

        expect(activity.getJulianDay()).toBe(expectedJulianDay);
      });

      it('should correctly handle 15 minutes before midnight during standard time (late April)', () => {
        // April 24, 2026 is during standard time (ACST = UTC+09:30)
        // 23:45 ACST on 2026-04-24 = 2026-04-24T14:15:00Z (UTC)
        const activity = createTestActivity(
          ctx,
          '2026-04-24T14:15:00Z', // UTC time
          '2026-04-24T23:45:00', // Local time (15 minutes before midnight on the 24th)
          '(GMT+09:30) Australia/Adelaide',
        );

        expect(activity.getJulianDay()).toBe(expectedJulianDay);
      });
    });
  });

  describe('julianDayInTz different dates', () => {
    it('should return different Julian Day for previous day', () => {
      const activity1 = createTestActivity(
        ctx,
        '2026-04-24T12:00:00Z',
        '2026-04-24T06:00:00',
        '(GMT-06:00) America/Costa_Rica',
      );

      const activity2 = createTestActivity(
        ctx,
        '2026-04-23T12:00:00Z',
        '2026-04-23T06:00:00',
        '(GMT-06:00) America/Costa_Rica',
      );

      const jd1 = activity1.getJulianDay();
      const jd2 = activity2.getJulianDay();

      expect(jd1).toBe(2461155);
      expect(jd2).toBe(2461154); // One day earlier
      expect(jd1 - jd2).toBe(1);
    });
  });
});
