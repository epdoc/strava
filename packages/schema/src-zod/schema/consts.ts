import { z } from '@zod/zod';

/**
 * Activity type names as defined by the Strava API.
 * @see https://developers.strava.com/docs/reference/#api-models-ActivityType
 */
export const ActivityName = {
  AlpineSki: 'AlpineSki',
  BackcountrySki: 'BackcountrySki',
  Canoeing: 'Canoeing',
  Crossfit: 'Crossfit',
  EBikeRide: 'EBikeRide',
  Elliptical: 'Elliptical',
  Hike: 'Hike',
  IceSkate: 'IceSkate',
  InlineSkate: 'InlineSkate',
  Kayaking: 'Kayaking',
  Kitesurf: 'Kitesurf',
  NordicSki: 'NordicSki',
  Ride: 'Ride',
  RockClimbing: 'RockClimbing',
  RollerSki: 'RollerSki',
  Rowing: 'Rowing',
  Run: 'Run',
  Snowboard: 'Snowboard',
  Snowshoe: 'Snowshoe',
  StairStepper: 'StairStepper',
  StandUpPaddling: 'StandUpPaddling',
  Surfing: 'Surfing',
  Swim: 'Swim',
  VirtualRide: 'VirtualRide',
  Walk: 'Walk',
  WeightTraining: 'WeightTraining',
  Windsurf: 'Windsurf',
  Workout: 'Workout',
  Yoga: 'Yoga',
  Handcycle: 'Handcycle',
  Velomobile: 'Velomobile',
  VirtualRun: 'VirtualRun',
  Wheelchair: 'Wheelchair',
} as const;

/**
 * Zod schema for ActivityName.
 */
export const ActivityNameSchema = z.enum([
  'AlpineSki',
  'BackcountrySki',
  'Canoeing',
  'Crossfit',
  'EBikeRide',
  'Elliptical',
  'Hike',
  'IceSkate',
  'InlineSkate',
  'Kayaking',
  'Kitesurf',
  'NordicSki',
  'Ride',
  'RockClimbing',
  'RollerSki',
  'Rowing',
  'Run',
  'Snowboard',
  'Snowshoe',
  'StairStepper',
  'StandUpPaddling',
  'Surfing',
  'Swim',
  'VirtualRide',
  'Walk',
  'WeightTraining',
  'Windsurf',
  'Workout',
  'Yoga',
  'Handcycle',
  'Velomobile',
  'VirtualRun',
  'Wheelchair',
]);

/** Activity type inferred from ActivityNameSchema */
export type ActivityType = z.infer<typeof ActivityNameSchema>;

/**
 * Activity zone definitions (heartrate, power).
 */
export const ActivityZoneDefs = {
  Heartrate: 'heartrate',
  Power: 'power',
} as const;

/**
 * Zod schema for ActivityZoneType.
 */
export const ActivityZoneTypeSchema = z.enum([
  'heartrate',
  'power',
]);

/** Activity zone type inferred from ActivityZoneTypeSchema */
export type ActivityZoneType = z.infer<typeof ActivityZoneTypeSchema>;

/**
 * Follower status values.
 */
export const FollowerStatus = {
  Pending: 'pending',
  Accepted: 'accepted',
  Blocked: 'blocked',
} as const;

/**
 * Zod schema for FollowerStatus.
 */
export const FollowerStatusSchema = z.enum([
  'pending',
  'accepted',
  'blocked',
]);

/** Follower status type inferred from FollowerStatusSchema */
export type FollowerStatusType = z.infer<typeof FollowerStatusSchema>;

/**
 * Resource state values.
 * Meta = 1, Summary = 2, Detail = 3
 */
export const ResourceState = {
  Meta: 1,
  Summary: 2,
  Detail: 3,
} as const;

/**
 * Zod schema for ResourceState.
 */
export const ResourceStateSchema: z.ZodUnion<
  [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]
> = z.union([z.literal(1), z.literal(2), z.literal(3)]);

/** Resource state type inferred from ResourceStateSchema */
export type ResourceStateType = z.infer<typeof ResourceStateSchema>;

/**
 * Sex values.
 */
export const Sex = {
  Female: 'F',
  Male: 'M',
} as const;

/**
 * Zod schema for Sex.
 */
export const SexSchema = z.enum(['F', 'M']);

/** Sex type inferred from SexSchema */
export type SexType = z.infer<typeof SexSchema>;

/**
 * Sport names.
 */
export const SportName = {
  Cycling: 'cycling',
  Running: 'running',
  Triathlon: 'triathlon',
  Other: 'other',
} as const;

/**
 * Zod schema for SportName.
 */
export const SportNameSchema = z.enum([
  'cycling',
  'running',
  'triathlon',
  'other',
]);

/** Sport type inferred from SportNameSchema */
export type SportType = z.infer<typeof SportNameSchema>;

/**
 * Stream keys for Strava API stream types.
 */
export const StreamKeys = {
  Time: 'time',
  Distance: 'distance',
  LatLng: 'latlng',
  Altitude: 'altitude',
  VelocitySmooth: 'velocity_smooth',
  Heartrate: 'heartrate',
  Cadence: 'cadence',
  Watts: 'watts',
  Temp: 'temp',
  Moving: 'moving',
  GradeSmooth: 'grade_smooth',
} as const;

/**
 * Zod schema for StreamType.
 */
export const StreamTypeSchema = z.enum([
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
]);

/** Stream type inferred from StreamTypeSchema */
export type StreamType = z.infer<typeof StreamTypeSchema>;

/**
 * Unit system values.
 */
export const UnitSystem = {
  Feet: 'feet',
  Meters: 'meters',
} as const;

/**
 * Zod schema for UnitSystem.
 */
export const UnitSystemSchema = z.enum(['feet', 'meters']);

/** Unit system type inferred from UnitSystemSchema */
export type UnitSystemType = z.infer<typeof UnitSystemSchema>;

/**
 * Stream resolution values.
 */
export const StreamResolution = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const;

/**
 * Zod schema for StreamResolution.
 */
export const StreamResolutionSchema = z.enum([
  'low',
  'medium',
  'high',
]);

/** Stream resolution type inferred from StreamResolutionSchema */
export type StreamResolutionType = z.infer<typeof StreamResolutionSchema>;

/**
 * Stream series type values.
 */
export const StreamSeriesType = {
  Distance: 'distance',
  Time: 'time',
} as const;

/**
 * Zod schema for StreamSeriesType.
 */
export const StreamSeriesTypeSchema = z.enum([
  'distance',
  'time',
]);

/** Stream series type inferred from StreamSeriesTypeSchema */
export type StreamSeriesType = z.infer<typeof StreamSeriesTypeSchema>;
