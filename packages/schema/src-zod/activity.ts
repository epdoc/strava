/**
 * Activity namespace - Zod schemas and types for Strava activities.
 *
 * @example
 * ```typescript
 * import * as Activity from '@epdoc/strava-schema/activity';
 *
 * const result = Activity.Detailed.safeParse(apiResponse);
 * if (result.success) {
 *   console.log(result.data.name);
 * }
 * ```
 */

// Zod schemas with short names
export {
  ActivityIdSchema as Id,
  ActivityStatsSchema as Stats,
  ActivityTotalSchema as Total,
  ActivityZoneSchema as Zone,
  DetailedActivitySchema as Detailed,
  ExternalIdSchema as ExternalId,
  LapSchema as Lap,
  PolylineMapSchema as PolylineMap,
  SplitSchema as Split,
  SummaryActivitySchema as Summary,
  TimedZoneRangeSchema as TimedZoneRange,
  UploadIdSchema as UploadId,
} from './schema/activity.ts';

// TypeScript types
export type {
  ActivityId as IdType,
  ActivityStats as StatsType,
  ActivityTotal as TotalType,
  ActivityZone as ZoneType,
  DetailedActivity as DetailedType,
  ExternalId as ExternalIdType,
  Lap as LapType,
  PolylineMap as PolylineMapType,
  Split as SplitType,
  SummaryActivity as SummaryType,
  TimedZoneRange as TimedZoneRangeType,
  UploadId as UploadIdType,
} from './schema/activity.ts';
