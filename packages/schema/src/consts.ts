/**
 * Consts namespace - Constants and enums for Strava API.
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

// Export schemas and const objects
export {
  ActivityName,
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
} from './schema/consts.ts';

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
} from './schema/consts.ts';
