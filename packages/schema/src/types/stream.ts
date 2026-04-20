/**
 * Stream types for Strava API.
 *
 * Streams contain time-series data for activities (GPS coordinates, heart rate, etc.).
 */

import type { StreamResolution, StreamSeriesType, StreamType } from './core.ts';

// ============================================================================
// Base Stream Types
// ============================================================================

/**
 * Base stream interface for non-latlng data.
 */
export interface DataStream {
  type: Exclude<StreamType, 'latlng'>;
  original_size: number;
  resolution: StreamResolution;
  series_type: StreamSeriesType;
  data: number[];
}

/**
 * Latitude/Longitude stream interface.
 */
export interface LatLngStream {
  type: 'latlng';
  original_size: number;
  resolution: StreamResolution;
  series_type: StreamSeriesType;
  data: [number, number][];
}

/**
 * Union type for all stream types.
 */
export type Stream = DataStream | LatLngStream;

// ============================================================================
// Stream Set
// ============================================================================

/**
 * StreamSet contains all available streams for an activity.
 * Not all streams are present for every activity.
 */
export interface StreamSet {
  time?: DataStream;
  distance?: DataStream;
  latlng?: LatLngStream;
  altitude?: DataStream;
  velocity_smooth?: DataStream;
  heartrate?: DataStream;
  cadence?: DataStream;
  watts?: DataStream;
  temp?: DataStream;
  moving?: DataStream;
  grade_smooth?: DataStream;
}

// ============================================================================
// Stream Keys (for type-safe access)
// ============================================================================

/** Keys for numeric data streams (excluding latlng). */
export type DataStreamKey =
  | 'time'
  | 'distance'
  | 'altitude'
  | 'velocity_smooth'
  | 'heartrate'
  | 'cadence'
  | 'watts'
  | 'temp'
  | 'moving'
  | 'grade_smooth';

/** All stream keys including latlng. */
export type StreamKey = DataStreamKey | 'latlng';
