/**
 * Activity types for Strava API.
 */

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

// Re-export ActivityId from core
export type { ActivityId } from './core.ts';
import type { GearId } from './gear.ts';
import type { DetailedSegmentEffort, SummarySegmentEffort } from './segment.ts';
import type { SummaryGear } from './gear.ts';

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

/** A lap within an activity. */
export interface Lap {
  id: number;
  resource_state: ResourceState;
  name: string;
  activity: MetaActivity;
  athlete: MetaAthlete;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  device_watts?: boolean;
  average_watts?: number;
  lap_index: number;
  split: number;
  pace_zone?: number;
}

/** A split within an activity (metric or standard). */
export interface Split {
  average_speed: number;
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  pace_zone: number;
  moving_time: number;
  split: number;
}

/** Activity zone data (heartrate or power). */
export interface ActivityZone {
  score: number;
  distribution_buckets: TimedZoneRange[];
  type: ActivityZoneType;
  sensor_based: boolean;
  points: number;
  custom_zones: boolean;
  max: number;
}

/** Activity total statistics. */
export interface ActivityTotal {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

/** Activity statistics for an athlete. */
export interface ActivityStats {
  biggest_ride_distance: number;
  biggest_climb_elevation_gain: number;
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

/** Primary photo for an activity. */
export interface PhotoSummaryPrimary {
  id: number | null;
  source: number;
  unique_id: string;
  urls: Record<string, string>;
}

/** Photo summary for an activity. */
export interface PhotoSummary {
  count: number;
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
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  elev_high: number;
  elev_low: number;
  type: ActivityType | string; // Can be any string for custom types
  sport_type?: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset?: number;
  start_latlng?: number[];
  end_latlng?: number[];
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  total_photo_count: number;
  map: PolylineMap;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  workout_type?: number | null;
  average_speed: number;
  max_speed: number;
  has_kudoed: boolean;
  gear_id?: GearId | null;
  average_temp?: number;
  device_name?: string;
  pr_count?: number;
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
  max_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  average_watts?: number;
  max_heartrate?: number;
  average_heartrate?: number;
  suffer_score?: number | null;
  segment_leaderboard_opt_out?: boolean;
  leaderboard_opt_out?: boolean;
  private_note?: string;
}
