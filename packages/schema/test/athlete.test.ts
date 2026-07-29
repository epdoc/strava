import { assertEquals } from '@std/assert';
import * as Athlete from '../src/athlete.ts';

const validSummaryAthlete = {
  id: 12345,
  resource_state: 2,
  firstname: 'John',
  lastname: 'Doe',
  profile_medium: 'https://example.com/photo.jpg',
  profile: 'https://example.com/full-photo.jpg',
  city: 'San Francisco',
  state: 'CA',
  country: 'USA',
  sex: 'M',
  summit: true,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const validDetailedAthlete = {
  ...validSummaryAthlete,
  resource_state: 3,
  follower_count: 100,
  friend_count: 50,
  measurement_preference: 'feet',
  ftp: 250,
  clubs: [],
  bikes: [],
  shoes: [],
};

Deno.test('Athlete Types Summary Athlete should identify valid summary athlete', () => {
  assertEquals(Athlete.isSummary(validSummaryAthlete), true);
});

Deno.test('Athlete Types Summary Athlete should reject invalid athlete id', () => {
  const invalid = { ...validSummaryAthlete, id: 'not-a-number' };
  assertEquals(Athlete.isSummary(invalid), false);
});

Deno.test('Athlete Types Summary Athlete should reject missing firstname', () => {
  const missing = { id: 123, lastname: 'Doe' };
  assertEquals(Athlete.isSummary(missing), false);
});

Deno.test('Athlete Types Detailed Athlete should identify valid detailed athlete', () => {
  assertEquals(Athlete.isDetailed(validDetailedAthlete), true);
});

Deno.test('Athlete Types Detailed Athlete should reject missing detailed fields', () => {
  const missing = {
    id: 123,
    firstname: 'John',
    lastname: 'Doe',
  };
  assertEquals(Athlete.isDetailed(missing), false);
});

Deno.test('Athlete Types Detailed Athlete should validate with null ftp', () => {
  const withNullFtp = { ...validDetailedAthlete, ftp: null };
  assertEquals(Athlete.isDetailed(withNullFtp), true);
});
