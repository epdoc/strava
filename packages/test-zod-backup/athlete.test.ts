import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import * as Athlete from '../src/athlete.ts';

describe('Athlete Schemas', () => {
  const validSummaryAthlete = {
    id: 12345,
    resource_state: 2,
    firstname: 'John',
    lastname: 'Doe',
    profile_medium: 'https://example.com/profile_medium.jpg',
    profile: 'https://example.com/profile.jpg',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    sex: 'M',
    summit: true,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    weight: 70,
    badge_type_id: 1,
  };

  describe('Summary Schema', () => {
    it('should validate a valid summary athlete', () => {
      const result = Athlete.Summary.safeParse(validSummaryAthlete);
      expect(result.success).toBe(true);
    });

    it('should fail validation for missing required fields', () => {
      const invalidAthlete = { ...validSummaryAthlete };
      delete (invalidAthlete as Record<string, unknown>).firstname;
      const result = Athlete.Summary.safeParse(invalidAthlete);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields to be undefined', () => {
      const minimalAthlete = {
        id: 123,
        resource_state: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        profile_medium: '',
        profile: '',
        city: '',
        state: '',
        country: '',
        sex: 'F',
        summit: false,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      };
      const result = Athlete.Summary.safeParse(minimalAthlete);
      expect(result.success).toBe(true);
    });
  });

  describe('Detailed Schema', () => {
    const validDetailedAthlete = {
      ...validSummaryAthlete,
      follower_count: 100,
      friend_count: 50,
      measurement_preference: 'meters',
      ftp: 250,
      clubs: [],
      bikes: [],
      shoes: [],
      email: 'john@example.com',
      athlete_type: 1,
    };

    it('should validate a valid detailed athlete', () => {
      const result = Athlete.Detailed.safeParse(validDetailedAthlete);
      expect(result.success).toBe(true);
    });

    it('should validate with null ftp', () => {
      const athleteWithNullFtp = { ...validDetailedAthlete, ftp: null };
      const result = Athlete.Detailed.safeParse(athleteWithNullFtp);
      expect(result.success).toBe(true);
    });
  });

  describe('AthleteId Schema', () => {
    it('should validate a valid athlete ID', () => {
      const result = Athlete.Id.safeParse(12345);
      expect(result.success).toBe(true);
    });

    it('should fail validation for non-integer values', () => {
      const result = Athlete.Id.safeParse(123.456);
      expect(result.success).toBe(false);
    });
  });
});
