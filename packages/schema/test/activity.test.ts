import { assertEquals } from '@std/assert';
import * as Activity from '../src/activity.ts';

const validSummaryActivity = {
  id: 123456789,
  external_id: 'garmin_push_12345',
  upload_id: 12345,
  athlete: { id: 123, resource_state: 1 },
  name: 'Morning Run',
  distance: 5000,
  moving_time: 1500,
  elapsed_time: 1600,
  total_elevation_gain: 50,
  elev_high: 100,
  elev_low: 50,
  type: 'Run',
  start_date: '2024-01-15T08:00:00Z',
  start_date_local: '2024-01-15T08:00:00Z',
  timezone: '(GMT-08:00) America/Los_Angeles',
  achievement_count: 5,
  kudos_count: 10,
  comment_count: 2,
  athlete_count: 1,
  photo_count: 0,
  total_photo_count: 0,
  map: {
    id: 'a123456789',
    polyline: 'abc123',
    summary_polyline: 'def456',
  },
  trainer: false,
  commute: false,
  manual: false,
  private: false,
  flagged: false,
  average_speed: 3.33,
  max_speed: 5.5,
  has_kudoed: false,
};

const validDetailedActivity = {
  ...validSummaryActivity,
  description: 'A nice morning run',
  calories: 350,
  segment_efforts: [],
};

Deno.test('Activity Types Summary Activity should identify valid summary activity', () => {
  assertEquals(Activity.isSummary(validSummaryActivity), true);
});

Deno.test('Activity Types Summary Activity should reject invalid summary activity', () => {
  const invalid = { ...validSummaryActivity, id: 'not-a-number' };
  assertEquals(Activity.isSummary(invalid), false);
});

Deno.test('Activity Types Summary Activity should reject missing required fields', () => {
  const missing = { id: 123, name: 'Test' };
  assertEquals(Activity.isSummary(missing), false);
});

Deno.test('Activity Types Detailed Activity should identify valid detailed activity', () => {
  assertEquals(Activity.isDetailed(validDetailedActivity), true);
});

Deno.test('Activity Types Detailed Activity should reject missing calories field', () => {
  const missing = { ...validDetailedActivity };
  delete (missing as Record<string, unknown>).calories;
  assertEquals(Activity.isDetailed(missing), false);
});

Deno.test('Activity Types Activity Arrays should identify array of summary activities', () => {
  const activities = [
    { id: 1, name: 'Run 1', distance: 1000 },
    { id: 2, name: 'Run 2', distance: 2000 },
  ];
  assertEquals(Activity.isSummaryArray(activities), true);
});

Deno.test('Activity Types Activity Arrays should reject array with invalid items', () => {
  const activities = [
    { id: 1, name: 'Run 1', distance: 1000 },
    { id: 'invalid', name: 'Run 2', distance: 2000 },
  ];
  assertEquals(Activity.isSummaryArray(activities), false);
});
