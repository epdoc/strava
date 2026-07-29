import type { ISODate } from '@epdoc/datetime';
import type { Seconds } from '@epdoc/duration';
import type * as Strava from '@epdoc/strava-api';
import type * as Schema from '@epdoc/strava-schema';

/** A GPS coordinate value in decimal degrees. */
export type GpsDegrees = number;

/**
 * Cached segment data stored in ~/.strava/user.segments.json
 *
 * This represents the metadata for a starred segment that we cache locally
 * to avoid repeated API calls. Coordinates are optional and only cached
 * if they've been fetched for KML generation.
 */
export type CacheEntry = {
  id: Schema.Segment.Id;
  name: Schema.Segment.Name;
  distance: Strava.Metres;
  gradient: number;
  elevation: Strava.Metres;
  country?: string;
  state?: string;
};

export interface IData {
  id: Schema.Segment.Id;
  name: Schema.Segment.Name;
  elapsedTime: Seconds;
  movingTime: Seconds;
  distance: Strava.Metres;
  coordinates: Partial<Strava.TrackPoint>[];
  country: string;
  state: string;
}

/**
 * Base segment data with optional fields. Used to construct a SegmentBase
 * instance with any subset of core segment properties.
 */
export type Base = Partial<{
  id: Schema.Segment.Id;
  elapsedTime: Seconds;
  movingTime: number;
  distance: Strava.Metres;
}>;

/**
 * Structure of the ~/.strava/user.segments.json cache file
 *
 * Segments are keyed by segment ID (as string) for fast lookup.
 * The cache stores segment metadata and optionally coordinates.
 */
export type CacheFile = {
  description?: string;
  lastModified?: ISODate;
  segments: Record<Schema.Segment.Id, CacheEntry>; // Keyed by segment ID as string
};

/** An in-memory map of segment IDs to their cached entries. */
export type CacheMap = Map<Schema.Segment.Id, CacheEntry>;
