/**
 * Segment types for Strava API.
 */

import type { Integer, WholeNumber } from '@epdoc/type';
import type {
  Achievement,
  ActivityId,
  ActivityType,
  AthleteId,
  PolylineMap,
  SegmentId,
} from './core.ts';
import type {
  BPM,
  CountryCode2,
  EncodedPolyline,
  ISODateTime,
  Latitude,
  LocalDateTime,
  Longitude,
  Metres,
  Percent,
  RPM,
  Seconds,
  StateCode,
  Watts,
} from './units.ts';

// Re-export SegmentId from core
export type { SegmentId } from './core.ts';

// ============================================================================
// Segment IDs
// ============================================================================

/** Segment name type */
export type SegmentName = string;

// ============================================================================
// Segment Effort Types
// ============================================================================

/** Effort ID type */
export type EffortId = number;

/**
 * Summary segment effort - represents an athlete's effort on a segment.
 * Uses interface to handle circular dependency with SummarySegment.
 */
export interface SummarySegmentEffort {
  id: EffortId;
  activity_id?: ActivityId;
  athlete_id?: AthleteId;
  segment_id?: SegmentId;
  name?: string;
  elapsed_time: Seconds;
  moving_time?: Seconds;
  /** ISO 8601 datetime when effort started (UTC) */
  start_date: ISODateTime;
  /** Local datetime when effort started (no timezone - use with `timezone` field) */
  start_date_local: LocalDateTime;
  distance: Metres;
  start_index?: Integer;
  end_index?: Integer;
  average_cadence?: RPM;
  average_watts?: Watts;
  device_watts?: boolean;
  average_heartrate?: BPM;
  max_heartrate?: BPM;
  segment?: SummarySegment;
  /** KOM (King of Mountain) rank on segment leaderboards */
  kom_rank?: Integer | null;
  /** PR (Personal Record) rank */
  pr_rank?: Integer | null;
  hidden?: boolean;
  is_kom: boolean;
  has_heartrate?: boolean;
}

/**
 * Detailed segment effort - extends SummarySegmentEffort with additional fields.
 */
export interface DetailedSegmentEffort extends SummarySegmentEffort {
  achievements?: Achievement[];
}

// ============================================================================
// Segment Types
// ============================================================================

/**
 * Summary segment - represents a segment with basic information.
 * Uses interface to handle circular dependency with SummarySegmentEffort.
 */
export interface SummarySegment {
  id: SegmentId;
  name: SegmentName;
  activity_type: ActivityType | string;
  distance: Metres;
  average_grade: Percent;
  maximum_grade: Percent;
  elevation_high: Metres;
  elevation_low: Metres;
  start_latlng: number[];
  end_latlng: number[];
  /** Climb difficulty category (0-5, where 5 is hardest) */
  climb_category: Integer;
  city: string;
  state: StateCode;
  country: CountryCode2;
  private: boolean;
  athlete_pr_effort?: SummarySegmentEffort;
  /** ISO 8601 datetime when segment was created */
  created_at?: ISODateTime;
  /** ISO 8601 datetime when segment was last updated */
  updated_at?: ISODateTime;
  total_elevation_gain?: Metres;
  map?: PolylineMap;
  /** Number of recorded efforts on this segment */
  effort_count?: WholeNumber;
  /** Number of unique athletes who have attempted this segment */
  athlete_count?: WholeNumber;
  hazardous?: boolean;
  /** Number of athletes who have starred this segment */
  star_count?: WholeNumber;
  starred?: boolean;
}

/**
 * Detailed segment - extends SummarySegment with additional fields.
 */
export interface DetailedSegment extends SummarySegment {
  created_by?: string;
  athletes_pr_time?: Seconds;
  /** ISO 8601 datetime when segment was starred by athlete */
  starred_date?: ISODateTime;
}

// ============================================================================
// Explorer Segment
// ============================================================================

/** Explorer segment - used for segment exploration API. */
export interface ExplorerSegment {
  id: SegmentId;
  name: SegmentName;
  /** Climb difficulty category (0-5, where 5 is hardest) */
  climb_category: Integer;
  climb_category_desc: string;
  avg_grade: Percent;
  /** Start point as [latitude, longitude] */
  start_latlng: [Latitude, Longitude];
  /** End point as [latitude, longitude] */
  end_latlng: [Latitude, Longitude];
  elev_difference: Metres;
  distance: Metres;
  /** Encoded polyline of segment points */
  points: EncodedPolyline;
}
