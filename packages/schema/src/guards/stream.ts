/**
 * Stream type guard functions for @epdoc/strava-schema.
 */

import type { DataStream, LatLngStream, Stream, StreamSet } from '../types/stream.ts';
import { isDict } from './core.ts';

// ============================================================================
// Stream Guards
// ============================================================================

/**
 * Check if a value is a DataStream.
 * Validates critical fields: type, data array.
 */
export function isDataStream(value: unknown): value is DataStream {
  if (!isDict(value)) return false;

  return typeof value.type === 'string' &&
    value.type !== 'latlng' &&
    Array.isArray(value.data);
}

/**
 * Check if a value is a LatLngStream.
 * Validates critical fields: type is 'latlng', data is array of [lat, lng] pairs.
 */
export function isLatLngStream(value: unknown): value is LatLngStream {
  if (!isDict(value)) return false;

  if (value.type !== 'latlng') return false;
  if (!Array.isArray(value.data)) return false;

  // Check first element is a [number, number] tuple
  const first = value.data[0];
  return Array.isArray(first) &&
    first.length === 2 &&
    typeof first[0] === 'number' &&
    typeof first[1] === 'number';
}

/**
 * Check if a value is a Stream (either DataStream or LatLngStream).
 */
export function isStream(value: unknown): value is Stream {
  return isDataStream(value) || isLatLngStream(value);
}

/**
 * Check if a value is a StreamSet.
 * Validates that it's an object with potential stream properties.
 */
export function isStreamSet(value: unknown): value is StreamSet {
  if (!isDict(value)) return false;

  // Check that any present properties are valid streams
  const streamKeys = [
    'time',
    'distance',
    'latlng',
    'altitude',
    'velocity_smooth',
    'heartrate',
    'cadence',
    'watts',
    'temp',
    'moving',
    'grade_smooth',
  ];

  for (const key of streamKeys) {
    if (key in value) {
      const stream = value[key];
      if (stream !== undefined && stream !== null && !isStream(stream)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if a StreamSet has valid latlng data.
 */
export function hasLatLngStream(
  streamSet: StreamSet,
): streamSet is StreamSet & { latlng: LatLngStream } {
  return streamSet.latlng !== undefined && isLatLngStream(streamSet.latlng);
}
