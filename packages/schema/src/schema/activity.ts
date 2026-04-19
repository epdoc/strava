import { z } from 'zod';
import { ActivityZoneTypeSchema, ResourceStateSchema } from './consts.ts';
import { GearIdSchema, SummaryGearSchema } from './gear.ts';
import { PhotoSummarySchema } from './photo.ts';
import type { DetailedSegmentEffort } from './segment.ts';
import {
  type ActivityType,
  MetaActivitySchema,
  MetaAthleteSchema,
  StravaLongIntSchema,
} from './types.ts';

/**
 * Zod schema for ActivityId.
 */
export const ActivityIdSchema = StravaLongIntSchema;

/** ActivityId type inferred from ActivityIdSchema */
export type ActivityId = z.infer<typeof ActivityIdSchema>;

/**
 * Zod schema for ExternalId.
 */
export const ExternalIdSchema = z.string();

/** ExternalId type inferred from ExternalIdSchema */
export type ExternalId = z.infer<typeof ExternalIdSchema>;

/**
 * Zod schema for UploadId.
 */
export const UploadIdSchema = StravaLongIntSchema.nullable();

/** UploadId type inferred from UploadIdSchema */
export type UploadId = z.infer<typeof UploadIdSchema>;

/**
 * Zod schema for TimedZoneRange.
 */
export const TimedZoneRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  time: z.number(),
});

/** TimedZoneRange type inferred from TimedZoneRangeSchema */
export type TimedZoneRange = z.infer<typeof TimedZoneRangeSchema>;

/**
 * Zod schema for PolylineMap.
 */
export const PolylineMapSchema = z.object({
  id: z.string(),
  polyline: z.string().nullable(),
  summary_polyline: z.string(),
  resource_state: ResourceStateSchema.optional(),
});

/** PolylineMap type inferred from PolylineMapSchema */
export type PolylineMap = z.infer<typeof PolylineMapSchema>;

/**
 * Zod schema for Split.
 */
export const SplitSchema = z.object({
  average_speed: z.number(),
  distance: z.number(),
  elapsed_time: z.number(),
  elevation_difference: z.number(),
  pace_zone: z.number(),
  moving_time: z.number(),
  split: z.number(),
});

/** Split type inferred from SplitSchema */
export type Split = z.infer<typeof SplitSchema>;

/**
 * Zod schema for ActivityZone.
 */
export const ActivityZoneSchema = z.object({
  score: z.number(),
  distribution_buckets: z.array(TimedZoneRangeSchema),
  type: ActivityZoneTypeSchema,
  sensor_based: z.boolean(),
  points: z.number(),
  custom_zones: z.boolean(),
  max: z.number(),
});

/** ActivityZone type inferred from ActivityZoneSchema */
export type ActivityZone = z.infer<typeof ActivityZoneSchema>;

/**
 * Zod schema for ActivityTotal.
 */
export const ActivityTotalSchema = z.object({
  count: z.number(),
  distance: z.number(),
  moving_time: z.number(),
  elapsed_time: z.number(),
  elevation_gain: z.number(),
  achievement_count: z.number().optional(),
});

/** ActivityTotal type inferred from ActivityTotalSchema */
export type ActivityTotal = z.infer<typeof ActivityTotalSchema>;

/**
 * Zod schema for ActivityStats.
 */
export const ActivityStatsSchema = z.object({
  biggest_ride_distance: z.number(),
  biggest_climb_elevation_gain: z.number(),
  recent_ride_totals: ActivityTotalSchema,
  recent_run_totals: ActivityTotalSchema,
  recent_swim_totals: ActivityTotalSchema,
  ytd_ride_totals: ActivityTotalSchema,
  ytd_run_totals: ActivityTotalSchema,
  ytd_swim_totals: ActivityTotalSchema,
  all_ride_totals: ActivityTotalSchema,
  all_run_totals: ActivityTotalSchema,
  all_swim_totals: ActivityTotalSchema,
});

/** ActivityStats type inferred from ActivityStatsSchema */
export type ActivityStats = z.infer<typeof ActivityStatsSchema>;

/**
 * Zod schema for SummaryActivity.
 */
export const SummaryActivitySchema = z.object({
  id: ActivityIdSchema,
  external_id: ExternalIdSchema.nullable(),
  upload_id: UploadIdSchema,
  athlete: MetaAthleteSchema,
  name: z.string(),
  distance: z.number(),
  moving_time: z.number(),
  elapsed_time: z.number(),
  total_elevation_gain: z.number(),
  elev_high: z.number(),
  elev_low: z.number(),
  type: z.string(), // Activity type can be any string
  sport_type: z.string().optional(),
  start_date: z.string().datetime(),
  start_date_local: z.string().datetime(),
  timezone: z.string(),
  utc_offset: z.number().optional(),
  start_latlng: z.array(z.number()).optional(),
  end_latlng: z.array(z.number()).optional(),
  achievement_count: z.number(),
  kudos_count: z.number(),
  comment_count: z.number(),
  athlete_count: z.number(),
  photo_count: z.number(),
  total_photo_count: z.number(),
  map: PolylineMapSchema,
  trainer: z.boolean(),
  commute: z.boolean(),
  manual: z.boolean(),
  private: z.boolean(),
  flagged: z.boolean(),
  workout_type: z.number().nullable().optional(),
  average_speed: z.number(),
  max_speed: z.number(),
  has_kudoed: z.boolean(),
  gear_id: GearIdSchema.nullable().optional(),
  average_temp: z.number().optional(),
  device_name: z.string().optional(),
  pr_count: z.number().optional(),
  from_accepted_tag: z.boolean().optional(),
});

/** SummaryActivity type inferred from SummaryActivitySchema */
export type SummaryActivity = z.infer<typeof SummaryActivitySchema>;

/**
 * Zod schema for Lap.
 */
export const LapSchema = z.object({
  id: StravaLongIntSchema,
  resource_state: ResourceStateSchema,
  name: z.string(),
  activity: MetaActivitySchema,
  athlete: MetaAthleteSchema,
  elapsed_time: z.number(),
  moving_time: z.number(),
  start_date: z.string().datetime(),
  start_date_local: z.string().datetime(),
  distance: z.number(),
  start_index: z.number(),
  end_index: z.number(),
  total_elevation_gain: z.number(),
  average_speed: z.number(),
  max_speed: z.number(),
  average_cadence: z.number().optional(),
  device_watts: z.boolean().optional(),
  average_watts: z.number().optional(),
  lap_index: z.number(),
  split: z.number(),
  pace_zone: z.number().optional(),
});

/** Lap type inferred from LapSchema */
export type Lap = z.infer<typeof LapSchema>;

/**
 * Zod schema for DetailedActivity.
 * Extends SummaryActivity with additional fields.
 */
export const DetailedActivitySchema = SummaryActivitySchema.extend({
  description: z.string().nullable(),
  photos: PhotoSummarySchema.optional(),
  gear: SummaryGearSchema.optional(),
  calories: z.number(),
  segment_efforts: z.array(z.any() as z.ZodType<DetailedSegmentEffort>).optional(),
  embed_token: z.string().optional(),
  splits_metric: z.array(SplitSchema).optional(),
  splits_standard: z.array(SplitSchema).optional(),
  laps: z.array(LapSchema).optional(),
  best_efforts: z.array(z.any() as z.ZodType<DetailedSegmentEffort>).optional(),
  device_watts: z.boolean().optional(),
  has_heartrate: z.boolean().optional(),
  heartrate_mode: z.string().optional(),
  max_watts: z.number().optional(),
  weighted_average_watts: z.number().optional(),
  kilojoules: z.number().optional(),
  average_watts: z.number().optional(),
  max_heartrate: z.number().optional(),
  average_heartrate: z.number().optional(),
  suffer_score: z.number().nullable().optional(),
  segment_leaderboard_opt_out: z.boolean().optional(),
  leaderboard_opt_out: z.boolean().optional(),
  private_note: z.string().optional(),
});

/** DetailedActivity type inferred from DetailedActivitySchema */
export type DetailedActivity = z.infer<typeof DetailedActivitySchema>;
