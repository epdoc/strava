/**
 * Activity namespace - types and guards for Strava activities.
 *
 * @example
 * ```typescript
 * import * as Activity from '@epdoc/strava-schema/activity';
 *
 * if (Activity.isDetailed(apiResponse)) {
 *   console.log(apiResponse.name);
 * }
 * ```
 */

// Types
export type {
  ActivityId as Id,
  ActivityStats as Stats,
  ActivityTotal as Total,
  ActivityZone as Zone,
  DetailedActivity as Detailed,
  ExternalId,
  Lap,
  PhotoSummary as Photo,
  Split,
  SummaryActivity as Summary,
  UploadId,
} from './types/activity.ts';

// Type guards
export {
  isDetailedActivity as isDetailed,
  isDetailedActivityArray as isDetailedArray,
  isLap,
  isPhotoSummary as isPhoto,
  isSplit,
  isSummaryActivity as isSummary,
  isSummaryActivityArray as isSummaryArray,
} from './guards/activity.ts';
