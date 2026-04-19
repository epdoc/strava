import { z } from 'zod';
import type { ActivityId, PolylineMap } from './activity.ts';
import type { AthleteId } from './athlete.ts';
import { StravaLongIntSchema } from './types.ts';

/**
 * Zod schema for SegmentName.
 */
export const SegmentNameSchema: z.ZodString = z.string();

/** SegmentName type inferred from SegmentNameSchema */
export type SegmentName = z.infer<typeof SegmentNameSchema>;

/**
 * Zod schema for SegmentId.
 */
export const SegmentIdSchema: z.ZodNumber = StravaLongIntSchema;

/** SegmentId type inferred from SegmentIdSchema */
export type SegmentId = z.infer<typeof SegmentIdSchema>;

/**
 * Zod schema for EffortId.
 */
export const EffortIdSchema: z.ZodNumber = StravaLongIntSchema;

/** EffortId type inferred from EffortIdSchema */
export type EffortId = z.infer<typeof EffortIdSchema>;

/**
 * Zod schema for Achievement.
 */
export const AchievementSchema: z.ZodObject<{
  type: z.ZodOptional<z.ZodString>;
  rank: z.ZodOptional<z.ZodNumber>;
}> = z.object({
  type: z.string().optional(),
  rank: z.number().optional(),
});

/** Achievement type inferred from AchievementSchema */
export type Achievement = z.infer<typeof AchievementSchema>;

/**
 * Summary segment effort - represents an athlete's effort on a segment.
 * Using TypeScript interface to handle circular dependency with SummarySegment.
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
 * Summary segment - represents a segment with basic information.
 * Using TypeScript interface to handle circular dependency with SummarySegmentEffort.
 */
export interface SummarySegment {
  id: SegmentId;
  name: SegmentName;
  activity_type: string;
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
 * Detailed segment effort - extends SummarySegmentEffort with additional fields.
 */
export interface DetailedSegmentEffort extends SummarySegmentEffort {
  achievements?: Achievement[];
}

/**
 * Detailed segment - extends SummarySegment with additional fields.
 */
export interface DetailedSegment extends SummarySegment {
  created_by?: string;
  athletes_pr_time?: number;
  starred_date?: string;
}

/**
 * Zod schema for ExplorerSegment.
 * Used for segment exploration API.
 */
export const ExplorerSegmentSchema: z.ZodObject<{
  id: typeof SegmentIdSchema;
  name: typeof SegmentNameSchema;
  climb_category: z.ZodNumber;
  climb_category_desc: z.ZodString;
  avg_grade: z.ZodNumber;
  start_latlng: z.ZodArray<z.ZodNumber>;
  end_latlng: z.ZodArray<z.ZodNumber>;
  elev_difference: z.ZodNumber;
  distance: z.ZodNumber;
  points: z.ZodString;
}> = z.object({
  id: SegmentIdSchema,
  name: SegmentNameSchema,
  climb_category: z.number(),
  climb_category_desc: z.string(),
  avg_grade: z.number(),
  start_latlng: z.array(z.number()),
  end_latlng: z.array(z.number()),
  elev_difference: z.number(),
  distance: z.number(),
  points: z.string(),
});

/** ExplorerSegment type inferred from ExplorerSegmentSchema */
export type ExplorerSegment = z.infer<typeof ExplorerSegmentSchema>;

// Validation helper functions

/**
 * Validates if a value is a valid SummarySegmentEffort.
 * Note: This is a basic type check, not a full schema validation.
 */
export function isSummarySegmentEffort(value: unknown): value is SummarySegmentEffort {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as SummarySegmentEffort).id === 'number' &&
    'elapsed_time' in value &&
    typeof (value as SummarySegmentEffort).elapsed_time === 'number' &&
    'distance' in value &&
    typeof (value as SummarySegmentEffort).distance === 'number' &&
    'is_kom' in value &&
    typeof (value as SummarySegmentEffort).is_kom === 'boolean'
  );
}

/**
 * Validates if a value is a valid SummarySegment.
 * Note: This is a basic type check, not a full schema validation.
 */
export function isSummarySegment(value: unknown): value is SummarySegment {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as SummarySegment).id === 'number' &&
    'name' in value &&
    typeof (value as SummarySegment).name === 'string' &&
    'distance' in value &&
    typeof (value as SummarySegment).distance === 'number'
  );
}
