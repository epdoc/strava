import type * as Schema from '@epdoc/strava-schema';
import { assertEquals, assertExists } from '@std/assert';
import * as App from '../src/mod.ts';

Deno.test('segment utils asCacheEntry should convert valid SummarySegment to CacheEntry', () => {
  const summarySegment: Schema.Segment.Summary = {
    id: 12345,
    name: 'Test Segment',
    distance: 1500,
    average_grade: 5.2,
    elevation_high: 200,
    elevation_low: 150,
    country: 'USA',
    state: 'California',
    activity_type: 'Ride',
    maximum_grade: 8.0,
    start_latlng: [37.7749, -122.4194],
    end_latlng: [37.7750, -122.4195],
    climb_category: 0,
    city: 'San Francisco',
    private: false,
  };

  const cacheEntry = App.Segment.asCacheEntry(summarySegment);

  assertExists(cacheEntry);
  if (cacheEntry) {
    assertEquals(cacheEntry.id, 12345);
    assertEquals(cacheEntry.name, 'Test Segment');
    assertEquals(cacheEntry.distance, 1500);
    assertEquals(cacheEntry.gradient, 5.2);
    assertEquals(cacheEntry.elevation, 50);
    assertEquals(cacheEntry.country, 'USA');
    assertEquals(cacheEntry.state, 'California');
  }
});

Deno.test('segment utils asCacheEntry should trim segment name', () => {
  const summarySegment: Schema.Segment.Summary = {
    id: 67890,
    name: '  Padded Segment Name  ',
    distance: 1000,
    average_grade: 3.5,
    elevation_high: 100,
    elevation_low: 80,
    country: 'USA',
    state: 'Oregon',
    activity_type: 'Ride',
    maximum_grade: 6.0,
    start_latlng: [45.5231, -122.6765],
    end_latlng: [45.5232, -122.6766],
    climb_category: 0,
    city: 'Portland',
    private: false,
  };

  const cacheEntry = App.Segment.asCacheEntry(summarySegment);

  assertExists(cacheEntry);
  if (cacheEntry) {
    assertEquals(cacheEntry.name, 'Padded Segment Name');
  }
});

Deno.test('segment utils asCacheEntry should return undefined for invalid data with missing required fields', () => {
  const invalidSegment = {
    id: 12345,
    distance: 1500,
    average_grade: 5.2,
    elevation_high: 200,
    elevation_low: 150,
  } as unknown as Schema.Segment.Summary;

  const cacheEntry = App.Segment.asCacheEntry(invalidSegment);

  assertEquals(cacheEntry, undefined);
});

Deno.test('segment utils asCacheEntry should calculate elevation correctly', () => {
  const summarySegment: Schema.Segment.Summary = {
    id: 11111,
    name: 'Steep Hill',
    distance: 500,
    average_grade: 10.0,
    elevation_high: 350,
    elevation_low: 250,
    country: 'USA',
    state: 'Colorado',
    activity_type: 'Ride',
    maximum_grade: 15.0,
    start_latlng: [39.7392, -104.9903],
    end_latlng: [39.7393, -104.9904],
    climb_category: 2,
    city: 'Denver',
    private: false,
  };

  const cacheEntry = App.Segment.asCacheEntry(summarySegment);

  assertExists(cacheEntry);
  if (cacheEntry) {
    assertEquals(cacheEntry.elevation, 100);
  }
});
