/**
 * Activity type guard functions for @epdoc/strava-schema.
 */

import type {
  DetailedActivity,
  Lap,
  PhotoSummary,
  Split,
  SummaryActivity,
} from '../types/activity.ts';
import { isActivityId, isDict } from './core.ts';

// ============================================================================
// Activity Guards
// ============================================================================

/**
 * Check if a value is a SummaryActivity.
 * Validates only critical fields: id, name, distance.
 */
export function isSummaryActivity(value: unknown): value is SummaryActivity {
  if (!isDict(value)) return false;

  return isActivityId(value.id) &&
    typeof value.name === 'string' &&
    typeof value.distance === 'number';
}

/**
 * Check if a value is a DetailedActivity.
 * Validates critical fields: id, name, distance, calories.
 */
export function isDetailedActivity(value: unknown): value is DetailedActivity {
  if (!isSummaryActivity(value)) return false;

  return typeof (value as DetailedActivity).calories === 'number';
}

/**
 * Check if a value is an array of SummaryActivity objects.
 */
export function isSummaryActivityArray(value: unknown): value is SummaryActivity[] {
  return Array.isArray(value) && value.every(isSummaryActivity);
}

/**
 * Check if a value is an array of DetailedActivity objects.
 */
export function isDetailedActivityArray(value: unknown): value is DetailedActivity[] {
  return Array.isArray(value) && value.every(isDetailedActivity);
}

// ============================================================================
// Component Guards
// ============================================================================

/**
 * Check if a value is a Lap.
 */
export function isLap(value: unknown): value is Lap {
  return isDict(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.elapsed_time === 'number';
}

/**
 * Check if a value is a Split.
 */
export function isSplit(value: unknown): value is Split {
  return isDict(value) &&
    typeof value.average_speed === 'number' &&
    typeof value.distance === 'number';
}

/**
 * Check if a value is a PhotoSummary.
 */
export function isPhotoSummary(value: unknown): value is PhotoSummary {
  return isDict(value) &&
    typeof value.count === 'number' &&
    isDict(value.primary);
}
