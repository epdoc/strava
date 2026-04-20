/**
 * Strava API Schema Definitions
 *
 * This module provides Zod schemas and TypeScript types for all Strava API data structures.
 * All schemas can be used for runtime validation, and types are inferred from schemas.
 *
 * @example
 * ```typescript
 * import { SummaryActivitySchema, DetailedActivity } from '@jpravetz/strava-schema/schema';
 *
 * // Validate unknown data
 * const result = SummaryActivitySchema.safeParse(unknownData);
 * if (result.success) {
 *   const activity: DetailedActivity = result.data;
 * }
 * ```
 */

// Constants and enums - export schemas and types separately
export {
  // Const assertions
  ActivityName,
  // Zod schemas
  ActivityNameSchema,
  ActivityZoneDefs,
  ActivityZoneTypeSchema,
  FollowerStatus,
  FollowerStatusSchema,
  ResourceState,
  ResourceStateSchema,
  Sex,
  SexSchema,
  SportName,
  SportNameSchema,
  StreamKeys,
  StreamResolution,
  StreamResolutionSchema,
  StreamSeriesType,
  StreamSeriesTypeSchema,
  StreamTypeSchema,
  UnitSystem,
  UnitSystemSchema,
} from './consts.ts';

// Export types separately
export type {
  ActivityType,
  ActivityZoneType,
  FollowerStatusType,
  ResourceStateType,
  SexType,
  SportType,
  StreamResolutionType,
  StreamSeriesType as StreamSeriesTypeAlias,
  StreamType,
  UnitSystemType,
} from './consts.ts';

// Activity schemas
export {
  ActivityIdSchema,
  ActivityStatsSchema,
  ActivityTotalSchema,
  ActivityZoneSchema,
  DetailedActivitySchema,
  ExternalIdSchema,
  LapSchema,
  PolylineMapSchema,
  SplitSchema,
  SummaryActivitySchema,
  TimedZoneRangeSchema,
  UploadIdSchema,
} from './activity.ts';

export type {
  ActivityId,
  ActivityStats,
  ActivityTotal,
  ActivityZone,
  DetailedActivity,
  ExternalId,
  Lap,
  PolylineMap,
  Split,
  SummaryActivity,
  TimedZoneRange,
  UploadId,
} from './activity.ts';

// Athlete schemas
export {
  AthleteIdSchema,
  CommentSchema,
  DetailedAthleteSchema,
  SummaryAthleteSchema,
  SummaryClubSchema,
} from './athlete.ts';

export type {
  AthleteId,
  Comment,
  DetailedAthlete,
  SummaryAthlete,
  SummaryClub,
} from './athlete.ts';

// Gear schemas
export { DetailedGearSchema, GearIdSchema, SummaryGearSchema } from './gear.ts';

export type { DetailedGear, GearId, SummaryGear } from './gear.ts';

// Photo schemas
export { PhotoSummaryPrimarySchema, PhotoSummarySchema } from './photo.ts';

export type { PhotoSummary, PhotoSummary_primary } from './photo.ts';

// Segment schemas and types
export {
  AchievementSchema,
  EffortIdSchema,
  ExplorerSegmentSchema,
  isSummarySegment,
  isSummarySegmentEffort,
  SegmentIdSchema,
  SegmentNameSchema,
} from './segment.ts';

export type {
  Achievement,
  DetailedSegment,
  DetailedSegmentEffort,
  EffortId,
  ExplorerSegment,
  SegmentId,
  SegmentName,
  SummarySegment,
  SummarySegmentEffort,
} from './segment.ts';

// Stream schemas
export { LatLngStreamSchema, StreamSchema, StreamSetSchema } from './stream.ts';

export type { LatLngStream, Stream, StreamSet } from './stream.ts';

// Base types
export { MetaActivitySchema, MetaAthleteSchema, StravaLongIntSchema } from './types.ts';

export type { MetaActivity, MetaAthlete, StravaLongInt } from './types.ts';

// Zone schemas
export {
  HeartRateZoneRangesSchema,
  PowerZoneRangesSchema,
  ZoneRangeSchema,
  ZonesSchema,
} from './zones.ts';

export type { HeartRateZoneRanges, PowerZoneRanges, ZoneRange, Zones } from './zones.ts';
