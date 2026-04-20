/**
 * Segment types for Strava API.
 */

import type {
  Achievement,
  ActivityId,
  ActivityType,
  AthleteId,
  PolylineMap,
  SegmentId,
} from './core.ts';

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
  elapsed_time: number;
  moving_time?: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index?: number;
  end_index?: number;
  average_cadence?: number;
  average_watts?: number;
  device_watts?: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  segment?: SummarySegment;
  kom_rank?: number | null;
  pr_rank?: number | null;
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
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: number[];
  end_latlng: number[];
  climb_category: number;
  city: string;
  state: string;
  country: string;
  private: boolean;
  athlete_pr_effort?: SummarySegmentEffort;
  created_at?: string;
  updated_at?: string;
  total_elevation_gain?: number;
  map?: PolylineMap;
  effort_count?: number;
  athlete_count?: number;
  hazardous?: boolean;
  star_count?: number;
  starred?: boolean;
}

/**
 * Detailed segment - extends SummarySegment with additional fields.
 */
export interface DetailedSegment extends SummarySegment {
  created_by?: string;
  athletes_pr_time?: number;
  starred_date?: string;
}

// ============================================================================
// Explorer Segment
// ============================================================================

/** Explorer segment - used for segment exploration API. */
export interface ExplorerSegment {
  id: SegmentId;
  name: SegmentName;
  climb_category: number;
  climb_category_desc: string;
  avg_grade: number;
  start_latlng: number[];
  end_latlng: number[];
  elev_difference: number;
  distance: number;
  points: string;
}
