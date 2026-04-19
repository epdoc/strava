import { z } from 'zod';
import { ActivityZoneTypeSchema, ResourceStateSchema } from './consts.ts';
import { GearIdSchema, SummaryGearSchema } from './gear.ts';
import { PhotoSummarySchema } from './photo.ts';
import type { DetailedSegmentEffort } from './segment.ts';
import { MetaActivitySchema, MetaAthleteSchema, StravaLongIntSchema } from './types.ts';

/**
 * Zod schema for ActivityId.
 */
export const ActivityIdSchema: z.ZodNumber = StravaLongIntSchema;

/** ActivityId type inferred from ActivityIdSchema */
export type ActivityId = z.infer<typeof ActivityIdSchema>;

/**
 * Zod schema for ExternalId.
 */
export const ExternalIdSchema: z.ZodString = z.string();

/** ExternalId type inferred from ExternalIdSchema */
export type ExternalId = z.infer<typeof ExternalIdSchema>;

/**
 * Zod schema for UploadId.
 */
export const UploadIdSchema: z.ZodNullable<z.ZodNumber> = StravaLongIntSchema.nullable();

/** UploadId type inferred from UploadIdSchema */
export type UploadId = z.infer<typeof UploadIdSchema>;

/**
 * Zod schema for TimedZoneRange.
 */
export const TimedZoneRangeSchema: z.ZodObject<{
  min: z.ZodNumber;
  max: z.ZodNumber;
  time: z.ZodNumber;
}> = z.object({
  min: z.number(),
  max: z.number(),
  time: z.number(),
});

/** TimedZoneRange type inferred from TimedZoneRangeSchema */
export type TimedZoneRange = z.infer<typeof TimedZoneRangeSchema>;

/**
 * Zod schema for PolylineMap.
 */
export const PolylineMapSchema: z.ZodObject<{
  id: z.ZodString;
  polyline: z.ZodNullable<z.ZodString>;
  summary_polyline: z.ZodString;
  resource_state: z.ZodOptional<typeof ResourceStateSchema>;
}> = z.object({
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
export const SplitSchema: z.ZodObject<{
  average_speed: z.ZodNumber;
  distance: z.ZodNumber;
  elapsed_time: z.ZodNumber;
  elevation_difference: z.ZodNumber;
  pace_zone: z.ZodNumber;
  moving_time: z.ZodNumber;
  split: z.ZodNumber;
}> = z.object({
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
export const ActivityZoneSchema: z.ZodObject<{
  score: z.ZodNumber;
  distribution_buckets: z.ZodArray<typeof TimedZoneRangeSchema>;
  type: typeof ActivityZoneTypeSchema;
  sensor_based: z.ZodBoolean;
  points: z.ZodNumber;
  custom_zones: z.ZodBoolean;
  max: z.ZodNumber;
}> = z.object({
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
export const ActivityTotalSchema: z.ZodObject<{
  count: z.ZodNumber;
  distance: z.ZodNumber;
  moving_time: z.ZodNumber;
  elapsed_time: z.ZodNumber;
  elevation_gain: z.ZodNumber;
  achievement_count: z.ZodOptional<z.ZodNumber>;
}> = z.object({
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
export const ActivityStatsSchema: z.ZodObject<{
  biggest_ride_distance: z.ZodNumber;
  biggest_climb_elevation_gain: z.ZodNumber;
  recent_ride_totals: typeof ActivityTotalSchema;
  recent_run_totals: typeof ActivityTotalSchema;
  recent_swim_totals: typeof ActivityTotalSchema;
  ytd_ride_totals: typeof ActivityTotalSchema;
  ytd_run_totals: typeof ActivityTotalSchema;
  ytd_swim_totals: typeof ActivityTotalSchema;
  all_ride_totals: typeof ActivityTotalSchema;
  all_run_totals: typeof ActivityTotalSchema;
  all_swim_totals: typeof ActivityTotalSchema;
}> = z.object({
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
export const SummaryActivitySchema: z.ZodObject<{
  id: typeof ActivityIdSchema;
  external_id: z.ZodNullable<typeof ExternalIdSchema>;
  upload_id: typeof UploadIdSchema;
  athlete: typeof MetaAthleteSchema;
  name: z.ZodString;
  distance: z.ZodNumber;
  moving_time: z.ZodNumber;
  elapsed_time: z.ZodNumber;
  total_elevation_gain: z.ZodNumber;
  elev_high: z.ZodNumber;
  elev_low: z.ZodNumber;
  type: z.ZodString;
  sport_type: z.ZodOptional<z.ZodString>;
  start_date: z.ZodString;
  start_date_local: z.ZodString;
  timezone: z.ZodString;
  utc_offset: z.ZodOptional<z.ZodNumber>;
  start_latlng: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
  end_latlng: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
  achievement_count: z.ZodNumber;
  kudos_count: z.ZodNumber;
  comment_count: z.ZodNumber;
  athlete_count: z.ZodNumber;
  photo_count: z.ZodNumber;
  total_photo_count: z.ZodNumber;
  map: typeof PolylineMapSchema;
  trainer: z.ZodBoolean;
  commute: z.ZodBoolean;
  manual: z.ZodBoolean;
  private: z.ZodBoolean;
  flagged: z.ZodBoolean;
  workout_type: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
  average_speed: z.ZodNumber;
  max_speed: z.ZodNumber;
  has_kudoed: z.ZodBoolean;
  gear_id: z.ZodOptional<z.ZodNullable<typeof GearIdSchema>>;
  average_temp: z.ZodOptional<z.ZodNumber>;
  device_name: z.ZodOptional<z.ZodString>;
  pr_count: z.ZodOptional<z.ZodNumber>;
  from_accepted_tag: z.ZodOptional<z.ZodBoolean>;
}> = z.object({
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
export const LapSchema: z.ZodObject<{
  id: typeof StravaLongIntSchema;
  resource_state: typeof ResourceStateSchema;
  name: z.ZodString;
  activity: typeof MetaActivitySchema;
  athlete: typeof MetaAthleteSchema;
  elapsed_time: z.ZodNumber;
  moving_time: z.ZodNumber;
  start_date: z.ZodString;
  start_date_local: z.ZodString;
  distance: z.ZodNumber;
  start_index: z.ZodNumber;
  end_index: z.ZodNumber;
  total_elevation_gain: z.ZodNumber;
  average_speed: z.ZodNumber;
  max_speed: z.ZodNumber;
  average_cadence: z.ZodOptional<z.ZodNumber>;
  device_watts: z.ZodOptional<z.ZodBoolean>;
  average_watts: z.ZodOptional<z.ZodNumber>;
  lap_index: z.ZodNumber;
  split: z.ZodNumber;
  pace_zone: z.ZodOptional<z.ZodNumber>;
}> = z.object({
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
export const DetailedActivitySchema: z.ZodObject<
  z.objectUtil.extendShape<
    typeof SummaryActivitySchema.shape,
    {
      description: z.ZodNullable<z.ZodString>;
      photos: z.ZodOptional<typeof PhotoSummarySchema>;
      gear: z.ZodOptional<typeof SummaryGearSchema>;
      calories: z.ZodNumber;
      segment_efforts: z.ZodOptional<z.ZodArray<z.ZodType<DetailedSegmentEffort>>>;
      embed_token: z.ZodOptional<z.ZodString>;
      splits_metric: z.ZodOptional<z.ZodArray<typeof SplitSchema>>;
      splits_standard: z.ZodOptional<z.ZodArray<typeof SplitSchema>>;
      laps: z.ZodOptional<z.ZodArray<typeof LapSchema>>;
      best_efforts: z.ZodOptional<z.ZodArray<z.ZodType<DetailedSegmentEffort>>>;
      device_watts: z.ZodOptional<z.ZodBoolean>;
      has_heartrate: z.ZodOptional<z.ZodBoolean>;
      heartrate_mode: z.ZodOptional<z.ZodString>;
      max_watts: z.ZodOptional<z.ZodNumber>;
      weighted_average_watts: z.ZodOptional<z.ZodNumber>;
      kilojoules: z.ZodOptional<z.ZodNumber>;
      average_watts: z.ZodOptional<z.ZodNumber>;
      max_heartrate: z.ZodOptional<z.ZodNumber>;
      average_heartrate: z.ZodOptional<z.ZodNumber>;
      suffer_score: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
      segment_leaderboard_opt_out: z.ZodOptional<z.ZodBoolean>;
      leaderboard_opt_out: z.ZodOptional<z.ZodBoolean>;
      private_note: z.ZodOptional<z.ZodString>;
    }
  >
> = SummaryActivitySchema.extend({
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
