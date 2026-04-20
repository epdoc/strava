/**
 * Tests for Athlete types and guards
 */

import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import * as Athlete from '../src/athlete.ts';

describe('Athlete Types', () => {
  describe('Summary Athlete', () => {
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

    it('should identify valid summary athlete', () => {
      expect(Athlete.isSummary(validSummaryAthlete)).toBe(true);
    });

    it('should reject invalid athlete id', () => {
      const invalid = { ...validSummaryAthlete, id: 'not-a-number' };
      expect(Athlete.isSummary(invalid)).toBe(false);
    });

    it('should reject missing firstname', () => {
      const missing = { id: 123, lastname: 'Doe' };
      expect(Athlete.isSummary(missing)).toBe(false);
    });
  });

  describe('Detailed Athlete', () => {
    const validDetailedAthlete = {
      id: 12345,
      resource_state: 3,
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
      follower_count: 100,
      friend_count: 50,
      measurement_preference: 'feet',
      ftp: 250,
      clubs: [],
      bikes: [],
      shoes: [],
    };

    it('should identify valid detailed athlete', () => {
      expect(Athlete.isDetailed(validDetailedAthlete)).toBe(true);
    });

    it('should reject missing detailed fields', () => {
      const missing = {
        id: 123,
        firstname: 'John',
        lastname: 'Doe',
      };
      expect(Athlete.isDetailed(missing)).toBe(false);
    });

    it('should validate with null ftp', () => {
      const withNullFtp = { ...validDetailedAthlete, ftp: null };
      expect(Athlete.isDetailed(withNullFtp)).toBe(true);
    });
  });
});
