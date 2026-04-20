/**
 * Athlete type guard functions for @epdoc/strava-schema.
 */

import type { DetailedAthlete, SummaryAthlete, SummaryClub } from '../types/athlete.ts';
import { isAthleteId, isDict } from './core.ts';

// ============================================================================
// Athlete Guards
// ============================================================================

/**
 * Check if a value is a SummaryAthlete.
 * Validates critical fields: id, firstname, lastname.
 */
export function isSummaryAthlete(value: unknown): value is SummaryAthlete {
  if (!isDict(value)) return false;

  return isAthleteId(value.id) &&
    typeof value.firstname === 'string' &&
    typeof value.lastname === 'string';
}

/**
 * Check if a value is a DetailedAthlete.
 * Validates critical fields and required DetailedAthlete fields.
 */
export function isDetailedAthlete(value: unknown): value is DetailedAthlete {
  if (!isSummaryAthlete(value)) return false;

  return typeof (value as DetailedAthlete).follower_count === 'number' &&
    typeof (value as DetailedAthlete).friend_count === 'number';
}

/**
 * Check if a value is an array of SummaryAthlete objects.
 */
export function isSummaryAthleteArray(value: unknown): value is SummaryAthlete[] {
  return Array.isArray(value) && value.every(isSummaryAthlete);
}

// ============================================================================
// Club Guards
// ============================================================================

/**
 * Check if a value is a SummaryClub.
 */
export function isSummaryClub(value: unknown): value is SummaryClub {
  return isDict(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.member_count === 'number';
}
