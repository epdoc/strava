/**
 * Segment type guard functions for @epdoc/strava-schema.
 */

import type {
  DetailedSegment,
  DetailedSegmentEffort,
  ExplorerSegment,
  SummarySegment,
  SummarySegmentEffort,
} from '../types/segment.ts';
import { isDict, isSegmentId } from './core.ts';

// ============================================================================
// Segment Guards
// ============================================================================

/**
 * Check if a value is a SummarySegment.
 * Validates critical fields: id, name, distance.
 */
export function isSummarySegment(value: unknown): value is SummarySegment {
  if (!isDict(value)) return false;

  return isSegmentId(value.id) &&
    typeof value.name === 'string' &&
    typeof value.distance === 'number';
}

/**
 * Check if a value is a DetailedSegment.
 */
export function isDetailedSegment(value: unknown): value is DetailedSegment {
  return isSummarySegment(value);
}

/**
 * Check if a value is an array of SummarySegment objects.
 */
export function isSummarySegmentArray(value: unknown): value is SummarySegment[] {
  return Array.isArray(value) && value.every(isSummarySegment);
}

// ============================================================================
// Segment Effort Guards
// ============================================================================

/**
 * Check if a value is a SummarySegmentEffort.
 * Validates critical fields: id, elapsed_time, distance.
 */
export function isSummarySegmentEffort(value: unknown): value is SummarySegmentEffort {
  if (!isDict(value)) return false;

  return typeof value.id === 'number' &&
    typeof value.elapsed_time === 'number' &&
    typeof value.distance === 'number';
}

/**
 * Check if a value is a DetailedSegmentEffort.
 */
export function isDetailedSegmentEffort(value: unknown): value is DetailedSegmentEffort {
  return isSummarySegmentEffort(value);
}

/**
 * Check if a value is an array of DetailedSegmentEffort objects.
 */
export function isDetailedSegmentEffortArray(value: unknown): value is DetailedSegmentEffort[] {
  return Array.isArray(value) && value.every(isDetailedSegmentEffort);
}

// ============================================================================
// Explorer Segment Guards
// ============================================================================

/**
 * Check if a value is an ExplorerSegment.
 */
export function isExplorerSegment(value: unknown): value is ExplorerSegment {
  return isDict(value) &&
    isSegmentId(value.id) &&
    typeof value.name === 'string' &&
    typeof value.distance === 'number';
}
