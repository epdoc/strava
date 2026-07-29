import { Ctx } from '@epdoc/strava-core';
import type * as StravaSchema from '@epdoc/strava-schema';
import { assertEquals } from '@std/assert';
import { Activity } from '../src/activity.ts';

const { Context } = Ctx;

function createTestContext(): Ctx.Context {
  return new Context({
    name: '@epdoc/strava-api-test',
    version: '1.0.0',
    description: 'Test package for strava-api',
  });
}

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
    distance: 20000,
    moving_time: 3600,
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

const ctx = createTestContext();
const expectedJulianDay = 2461155;

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for early morning ride in New Zealand', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-23T12:00:00Z',
    '2026-04-24T01:00:00',
    '(GMT+12:00) Pacific/Auckland',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for late evening ride in New Zealand', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-24T11:00:00Z',
    '2026-04-24T23:00:00',
    '(GMT+12:00) Pacific/Auckland',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for early morning ride in Hawaii', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-24T11:00:00Z',
    '2026-04-24T01:00:00',
    '(GMT-10:00) Pacific/Honolulu',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for late evening ride in Hawaii', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-25T09:00:00Z',
    '2026-04-24T23:00:00',
    '(GMT-10:00) Pacific/Honolulu',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for early morning ride in France', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-23T23:00:00Z',
    '2026-04-24T01:00:00',
    '(GMT+02:00) Europe/Paris',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for late evening ride in France', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-24T21:00:00Z',
    '2026-04-24T23:00:00',
    '(GMT+02:00) Europe/Paris',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for Costa Rica (the original issue location)', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-24T15:17:00Z',
    '2026-04-24T09:17:00',
    '(GMT-06:00) America/Costa_Rica',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for early morning ride in Adelaide, Australia', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-23T14:30:00Z',
    '2026-04-24T01:00:00',
    '(GMT+10:30) Australia/Adelaide',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones should return same Julian Day for late evening ride in Adelaide, Australia', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-24T12:30:00Z',
    '2026-04-24T23:00:00',
    '(GMT+10:30) Australia/Adelaide',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones Adelaide day boundary tests should correctly handle 15 minutes past midnight during daylight saving (early April)', () => {
  const activity = createTestActivity(
    ctx,
    '2026-03-31T13:45:00Z',
    '2026-04-01T00:15:00',
    '(GMT+10:30) Australia/Adelaide',
  );

  assertEquals(activity.getJulianDay(), 2461132);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones Adelaide day boundary tests should correctly handle 15 minutes before midnight during daylight saving (early April)', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-01T13:15:00Z',
    '2026-04-01T23:45:00',
    '(GMT+10:30) Australia/Adelaide',
  );

  assertEquals(activity.getJulianDay(), 2461132);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones Adelaide day boundary tests should correctly handle 15 minutes past midnight during standard time (late April)', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-23T14:45:00Z',
    '2026-04-24T00:15:00',
    '(GMT+09:30) Australia/Adelaide',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz consistency across timezones Adelaide day boundary tests should correctly handle 15 minutes before midnight during standard time (late April)', () => {
  const activity = createTestActivity(
    ctx,
    '2026-04-24T14:15:00Z',
    '2026-04-24T23:45:00',
    '(GMT+09:30) Australia/Adelaide',
  );

  assertEquals(activity.getJulianDay(), expectedJulianDay);
});

Deno.test('Activity Julian Day Calculation julianDayInTz different dates should return different Julian Day for previous day', () => {
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

  assertEquals(jd1, 2461155);
  assertEquals(jd2, 2461154);
  assertEquals(jd1 - jd2, 1);
});
