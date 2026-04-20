/**
 * Constants namespace - enums and constants for Strava API.
 *
 * @example
 * ```typescript
 * import * as Consts from '@epdoc/strava-schema/consts';
 *
 * if (activity.type === Consts.ActivityName.Ride) {
 *   // Handle ride
 * }
 * ```
 */

// Re-export all core constants
export { ActivityName, StreamKeys } from './types/core.ts';

// Re-export all core types
export type {
  Achievement,
  ActivityId,
  ActivityType,
  ActivityZoneType,
  AthleteId,
  FollowerStatus,
  MetaActivity,
  MetaAthlete,
  PolylineMap,
  ResourceState,
  SegmentId,
  Sex,
  SportType,
  StravaId,
  StreamResolution,
  StreamSeriesType,
  StreamType,
  UnitSystem,
} from './types/core.ts';

// Re-export core guards
export {
  isActivityId,
  isActivityType,
  isAthleteId,
  isGearId,
  isKnownActivityType,
  isResourceState,
  isSegmentId,
  isSex,
  isSportType,
  isStravaId,
  isStreamType,
  isUnitSystem,
} from './guards/core.ts';
