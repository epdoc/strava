import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import * as Activity from '../src/activity.ts';

describe('Activity Schemas', () => {
  const validSummaryActivity = {
    id: 123456789,
    external_id: 'external-123',
    upload_id: 987654321,
    athlete: { id: 12345, resource_state: 1 },
    name: 'Morning Run',
    distance: 5000,
    moving_time: 1800,
    elapsed_time: 1900,
    total_elevation_gain: 50,
    elev_high: 100,
    elev_low: 50,
    type: 'Run',
    sport_type: 'Run',
    start_date: '2024-01-15T08:00:00Z',
    start_date_local: '2024-01-15T08:00:00Z',
    timezone: '(GMT-08:00) America/Los_Angeles',
    utc_offset: -28800,
    start_latlng: [37.7749, -122.4194],
    end_latlng: [37.775, -122.4195],
    achievement_count: 3,
    kudos_count: 10,
    comment_count: 2,
    athlete_count: 1,
    photo_count: 0,
    total_photo_count: 0,
    map: {
      id: 'a123456789',
      polyline: 'abc123',
      summary_polyline: 'abc',
    },
    trainer: false,
    commute: false,
    manual: false,
    private: false,
    flagged: false,
    workout_type: null,
    average_speed: 2.778,
    max_speed: 4.5,
    has_kudoed: false,
    gear_id: 'gear123',
    average_temp: 15,
    device_name: 'Garmin Forerunner',
    pr_count: 1,
    from_accepted_tag: false,
  };

  describe('Summary Schema', () => {
    it('should validate a valid summary activity', () => {
      const result = Activity.Summary.safeParse(validSummaryActivity);
      expect(result.success).toBe(true);
    });

    it('should fail validation for missing required fields', () => {
      const invalidActivity = { ...validSummaryActivity };
      delete (invalidActivity as Record<string, unknown>).name;
      const result = Activity.Summary.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid types', () => {
      const invalidActivity = { ...validSummaryActivity, distance: '5000' };
      const result = Activity.Summary.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields to be undefined', () => {
      const minimalActivity = {
        id: 123,
        external_id: null,
        upload_id: null,
        athlete: { id: 1, resource_state: 1 },
        name: 'Test',
        distance: 1000,
        moving_time: 300,
        elapsed_time: 300,
        total_elevation_gain: 10,
        elev_high: 0,
        elev_low: 0,
        type: 'Run',
        start_date: '2024-01-15T08:00:00Z',
        start_date_local: '2024-01-15T08:00:00Z',
        timezone: 'GMT',
        achievement_count: 0,
        kudos_count: 0,
        comment_count: 0,
        athlete_count: 1,
        photo_count: 0,
        total_photo_count: 0,
        map: { id: 'a1', polyline: null, summary_polyline: '' },
        trainer: false,
        commute: false,
        manual: false,
        private: false,
        flagged: false,
        average_speed: 3,
        max_speed: 4,
        has_kudoed: false,
      };
      const result = Activity.Summary.safeParse(minimalActivity);
      expect(result.success).toBe(true);
    });
  });

  describe('Detailed Schema', () => {
    const validDetailedActivity = {
      ...validSummaryActivity,
      description: 'A nice morning run',
      calories: 350,
      segment_efforts: [],
      splits_metric: [],
      laps: [],
      best_efforts: [],
      device_watts: false,
      has_heartrate: true,
      heartrate_mode: 'default',
      max_watts: 0,
      weighted_average_watts: 0,
      kilojoules: 0,
      average_watts: 0,
      max_heartrate: 175,
      average_heartrate: 155,
      suffer_score: 50,
    };

    it('should validate a valid detailed activity', () => {
      const result = Activity.Detailed.safeParse(validDetailedActivity);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid calories type', () => {
      const invalidActivity = { ...validDetailedActivity, calories: '350' };
      const result = Activity.Detailed.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });
  });

  describe('ActivityId Schema', () => {
    it('should validate a valid activity ID', () => {
      const result = Activity.Id.safeParse(123456789);
      expect(result.success).toBe(true);
    });

    it('should fail validation for non-integer values', () => {
      const result = Activity.Id.safeParse(123.456);
      expect(result.success).toBe(false);
    });

    it('should fail validation for string values', () => {
      const result = Activity.Id.safeParse('123');
      expect(result.success).toBe(false);
    });
  });
});
