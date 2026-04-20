/**
 * Activity types for Strava API.
 */

import type { Integer, WholeNumber } from '@epdoc/type';
import type {
  ActivityId,
  ActivityType,
  ActivityZoneType,
  MetaActivity,
  MetaAthlete,
  PolylineMap,
  ResourceState,
  TimedZoneRange,
} from './core.ts';
import type { GearId, SummaryGear } from './gear.ts';
import type { DetailedSegmentEffort, SummarySegmentEffort } from './segment.ts';
import type * as Unit from './units.ts';

// Re-export ActivityId from core
export type { ActivityId } from './core.ts';

// ============================================================================
// Activity IDs
// ============================================================================

/** External ID from the original data source. */
export type ExternalId = string;

/** Upload ID for the activity. */
export type UploadId = number | null;

// ============================================================================
// Activity Components
// ============================================================================

/** Lap ID type */
export type LapId = Integer;

/** A lap within an activity. */
export interface Lap {
  id: LapId;
  resource_state: ResourceState;
  name: string;
  activity: MetaActivity;
  athlete: MetaAthlete;
  elapsed_time: Unit.Seconds;
  moving_time: Unit.Seconds;
  /** ISO 8601 datetime when lap started (UTC) */
  start_date: Unit.ISODateTime;
  /** Local datetime when lap started (no timezone - use with `timezone` field) */
  start_date_local: Unit.LocalDateTime;
  distance: Unit.Metres;
  start_index: Integer;
  end_index: Integer;
  total_elevation_gain: Unit.Metres;
  average_speed: Unit.MetresPerSecond;
  max_speed: Unit.MetresPerSecond;
  average_cadence?: Unit.RPM;
  device_watts?: boolean;
  average_watts?: Unit.Watts;
  lap_index: Integer;
  split: number;
  pace_zone?: number;
}

/** A split within an activity (metric or standard). */
export interface Split {
  average_speed: Unit.MetresPerSecond;
  distance: Unit.Metres;
  elapsed_time: Unit.Seconds;
  elevation_difference: Unit.Metres;
  pace_zone: number;
  moving_time: Unit.Seconds;
  split: number;
}

/** Activity zone data (heartrate or power). */
export interface ActivityZone {
  score: Integer;
  distribution_buckets: TimedZoneRange[];
  type: ActivityZoneType;
  sensor_based: boolean;
  points: Integer;
  custom_zones: boolean;
  max: Integer;
}

/** Activity total statistics. */
export interface ActivityTotal {
  count: WholeNumber;
  distance: Unit.Metres;
  moving_time: Unit.Seconds;
  elapsed_time: Unit.Seconds;
  elevation_gain: Unit.Metres;
  achievement_count?: WholeNumber;
}

/** Activity statistics for an athlete. */
export interface ActivityStats {
  biggest_ride_distance: Unit.Metres;
  biggest_climb_elevation_gain: Unit.Metres;
  recent_ride_totals: ActivityTotal;
  recent_run_totals: ActivityTotal;
  recent_swim_totals: ActivityTotal;
  ytd_ride_totals: ActivityTotal;
  ytd_run_totals: ActivityTotal;
  ytd_swim_totals: ActivityTotal;
  all_ride_totals: ActivityTotal;
  all_run_totals: ActivityTotal;
  all_swim_totals: ActivityTotal;
}

// ============================================================================
// Photo Types
// ============================================================================

/** Photo ID type */
export type PhotoId = Integer;

/** Primary photo for an activity. */
export interface PhotoSummaryPrimary {
  id: PhotoId | null;
  source: Integer;
  unique_id: string;
  urls: Record<string, Unit.Url>;
}

/** Photo summary for an activity. */
export interface PhotoSummary {
  count: Integer;
  primary: PhotoSummaryPrimary;
}

// ============================================================================
// Activity Main Types
// ============================================================================

/**
 * Summary activity - basic information about an activity.
 * This is the most common activity type returned by the API.
 */
export interface SummaryActivity {
  id: ActivityId;
  external_id: ExternalId | null;
  upload_id: UploadId;
  athlete: MetaAthlete;
  name: string;
  distance: Unit.Metres;
  moving_time: Unit.Seconds;
  elapsed_time: Unit.Seconds;
  total_elevation_gain: Unit.Metres;
  elev_high: Unit.Metres;
  elev_low: Unit.Metres;
  type: ActivityType | string; // Can be any string for custom types
  sport_type?: string;
  /** ISO 8601 datetime when activity started (UTC) */
  start_date: Unit.ISODateTime;
  /** Local datetime when activity started (no timezone - use with `timezone` field) */
  start_date_local: Unit.LocalDateTime;
  /** Timezone in display format (e.g., "(GMT-06:00) America/Chicago") */
  timezone: Unit.Timezone;
  utc_offset?: Unit.Seconds;
  /** Start point as [latitude, longitude] */
  start_latlng?: [Unit.Latitude, Unit.Longitude];
  /** End point as [latitude, longitude] */
  end_latlng?: [Unit.Latitude, Unit.Longitude];
  achievement_count: WholeNumber;
  kudos_count: WholeNumber;
  comment_count: WholeNumber;
  athlete_count: WholeNumber;
  photo_count: WholeNumber;
  total_photo_count: WholeNumber;
  map: PolylineMap;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  workout_type?: Integer | null;
  average_speed: Unit.MetresPerSecond;
  max_speed: Unit.MetresPerSecond;
  has_kudoed: boolean;
  gear_id?: GearId | null;
  average_temp?: Unit.Celsius;
  device_name?: string;
  pr_count?: WholeNumber;
  from_accepted_tag?: boolean;
}

/**
 * Detailed activity - full activity information.
 * Extends SummaryActivity with additional fields.
 */
export interface DetailedActivity extends SummaryActivity {
  description: string | null;
  photos?: PhotoSummary;
  gear?: SummaryGear;
  calories: number;
  segment_efforts?: DetailedSegmentEffort[];
  embed_token?: string;
  splits_metric?: Split[];
  splits_standard?: Split[];
  laps?: Lap[];
  best_efforts?: SummarySegmentEffort[];
  device_watts?: boolean;
  has_heartrate?: boolean;
  heartrate_mode?: string;
  max_watts?: Unit.Watts;
  weighted_average_watts?: Unit.Watts;
  kilojoules?: number;
  average_watts?: Unit.Watts;
  max_heartrate?: Unit.BPM;
  average_heartrate?: Unit.BPM;
  suffer_score?: number | null;
  segment_leaderboard_opt_out?: boolean;
  leaderboard_opt_out?: boolean;
  private_note?: string;
}
